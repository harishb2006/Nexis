import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import { retrieveRelevantChunks } from "../../rag/retriever.js";
import { ecommerceTools } from "../tools/ecommerceTools.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cerebras client
const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

/**
 * Convert LangChain tool to format Cerebras understands
 */
function convertToolsForCerebras(tools) {
  return tools.map(tool => {
    const parameters = {
      type: "object",
      properties: {},
      required: []
    };

    Object.entries(tool.schema.shape).forEach(([key, zodSchema]) => {
      const typeName = zodSchema._def.typeName;
      
      // Handle enums
      if (typeName === "ZodEnum") {
        parameters.properties[key] = {
          type: "string",
          enum: zodSchema._def.values,
          description: zodSchema.description || ""
        };
      }
      // Handle other types
      else if (typeName === "ZodString") {
        parameters.properties[key] = {
          type: "string",
          description: zodSchema.description || ""
        };
      } else if (typeName === "ZodNumber") {
        parameters.properties[key] = {
          type: "number",
          description: zodSchema.description || ""
        };
      }

      // Check if required
      if (!zodSchema.isOptional()) {
        parameters.required.push(key);
      }
    });

    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters
      }
    };
  });
}

/**
 * Execute a tool call
 */
async function executeTool(toolName, toolArgs) {
  const tool = ecommerceTools.find(t => t.name === toolName);
  if (!tool) {
    return JSON.stringify({ error: "Tool not found" });
  }
  
  try {
    const result = await tool.invoke(toolArgs);
    return result;
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({ error: error.message });
  }
}

/**
 * Generate AI response with RAG + Tools
 */
export async function generateAnswer(userQuestion, conversationHistory = []) {
  try {
    // Step 1: Retrieve relevant context from knowledge base
    console.log("🔍 Retrieving relevant context...");
    const relevantChunks = await retrieveRelevantChunks(userQuestion, 3);

    const context = relevantChunks
      .map((chunk, idx) => `[Context ${idx + 1}]:\n${chunk.content}`)
      .join("\n\n");

    console.log(`📚 Found ${relevantChunks.length} relevant chunks`);

    // Step 2: Build system prompt
    const systemPrompt = `You are a helpful customer support assistant for ShopHub e-commerce store.

You have access to tools that can:
- Check order status and details
- Look up products by category
- Get available product categories

IMPORTANT RULES:
1. Use the provided tools when customers ask about orders or products
2. Use the knowledge base context for general information
3. If context or tools don't have the answer, politely say so and offer to connect with support
4. Be friendly, concise, and helpful
5. When using tools, explain what you found clearly

${context ? `KNOWLEDGE BASE:\n${context}` : 'Knowledge base is currently empty.'}

Remember: Use tools for live data (orders, products), use context for policies and info.`;

    // Step 3: Build message history
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userQuestion },
    ];

    // Step 4: First AI call - decide if tools are needed
    console.log("🤖 Generating AI response with Cerebras...");
    
    const tools = convertToolsForCerebras(ecommerceTools);
    
    let completion = await cerebras.chat.completions.create({
      messages,
      model: "llama-3.3-70b",
      max_tokens: 800,
      temperature: 0.2,
      tools,
      tool_choice: "auto"
    });

    let assistantMessage = completion.choices[0].message;
    
    // Step 5: Handle tool calls if any
    let toolResults = [];
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🛠️  AI wants to use ${assistantMessage.tool_calls.length} tool(s)`);
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`   - Calling ${toolName} with:`, toolArgs);
        
        const result = await executeTool(toolName, toolArgs);
        
        toolResults.push({
          tool: toolName,
          result: JSON.parse(result)
        });

        // Add tool response to messages for next call
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [toolCall]
        });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result
        });
      }

      // Step 6: Get final response with tool results
      console.log("🤖 Getting final response with tool results...");
      completion = await cerebras.chat.completions.create({
        messages,
        model: "llama-3.3-70b",
        max_tokens: 800,
        temperature: 0.2,
      });

      assistantMessage = completion.choices[0].message;
    }

    console.log("✅ Response generated successfully");

    return {
      answer: assistantMessage.content,
      sources: relevantChunks.map((chunk) => ({
        content: chunk.content.substring(0, 150) + "...",
        relevance: (chunk.score * 100).toFixed(1) + "%",
      })),
      toolsUsed: toolResults.length > 0 ? toolResults : null,
      model: "llama-3.3-70b",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error generating answer:", error.message);
    throw error;
  }
}

// Test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testQuestion = process.argv[2] || "What categories do you have?";

  console.log("🧪 Testing RAG + Tools Chatbot\n");
  console.log("=".repeat(60));
  console.log(`Question: ${testQuestion}\n`);

  generateAnswer(testQuestion)
    .then((result) => {
      console.log("\n📝 AI Answer:\n");
      console.log(result.answer);
      
      if (result.toolsUsed) {
        console.log("\n🛠️  Tools Used:");
        result.toolsUsed.forEach((tool, idx) => {
          console.log(`\n${idx + 1}. ${tool.tool}`);
          console.log(`   Result:`, JSON.stringify(tool.result, null, 2));
        });
      }
      
      if (result.sources.length > 0) {
        console.log("\n📚 Knowledge Base Sources:");
        result.sources.forEach((source, idx) => {
          console.log(`\n${idx + 1}. (${source.relevance} relevant)`);
          console.log(`   ${source.content}`);
        });
      }
      
      console.log("\n" + "=".repeat(60));
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Test failed:", err.message);
      process.exit(1);
    });
}
