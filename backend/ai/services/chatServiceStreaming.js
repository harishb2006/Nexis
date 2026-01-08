import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import { retrieveRelevantChunks } from "../../rag/retriever.js";
import { ecommerceTools } from "../tools/ecommerceTools.js";
import dotenv from "dotenv";

dotenv.config();

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

/**
 * Convert LangChain tool to Cerebras format
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
      
      if (typeName === "ZodEnum") {
        parameters.properties[key] = {
          type: "string",
          enum: zodSchema._def.values,
          description: zodSchema.description || ""
        };
      } else if (typeName === "ZodString") {
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
 * Execute a tool with userId injection
 */
async function executeTool(toolName, toolArgs, userId = null) {
  const tool = ecommerceTools.find(t => t.name === toolName);
  if (!tool) {
    return JSON.stringify({ error: "Tool not found" });
  }
  
  try {
    // Inject userId into tool arguments if user is authenticated
    const enhancedArgs = userId ? { ...toolArgs, userId } : toolArgs;
    const result = await tool.invoke(enhancedArgs);
    return result;
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({ 
      success: false,
      error: error.message,
      message: "An error occurred while processing your request. Please try again."
    });
  }
}

/**
 * Get friendly tool names for UI display
 */
function getToolDisplayName(toolName) {
  const names = {
    'check_order': 'Checking Order Status',
    'get_my_orders': 'Fetching Your Orders',
    'search_products': 'Searching Products',
    'get_all_orders': 'Fetching All Orders',
    'update_order_status': 'Updating Order',
    'update_product_stock': 'Updating Stock',
    'check_refund_eligibility': 'Checking Refund Eligibility',
    'escalate_to_human': 'Escalating to Human Support'
  };
  return names[toolName] || toolName;
}

/**
 * Detect negative sentiment for auto-escalation
 */
function detectNegativeSentiment(text) {
  const negativeKeywords = [
    'frustrated', 'angry', 'terrible', 'horrible', 'awful', 'worst',
    'disappointed', 'upset', 'furious', 'manager', 'supervisor',
    'unacceptable', 'ridiculous', 'pathetic', 'useless', 'waste',
    'complaint', 'sue', 'lawyer', 'refund now', 'cancel everything'
  ];

  const lowerText = text.toLowerCase();
  const matchedKeywords = negativeKeywords.filter(keyword => 
    lowerText.includes(keyword)
  );

  return {
    isNegative: matchedKeywords.length > 0,
    keywords: matchedKeywords,
    severity: matchedKeywords.length >= 2 ? 'high' : matchedKeywords.length === 1 ? 'medium' : 'low'
  };
}

/**
 * Generate streaming AI response with RAG + Tools
 * This is a generator function that yields status updates
 */
export async function* generateAnswerStream(userQuestion, conversationHistory = [], threadId = null, userId = null) {
  try {
    // Detect negative sentiment
    const sentiment = detectNegativeSentiment(userQuestion);
    if (sentiment.isNegative) {
      yield { 
        type: 'sentiment_detected', 
        message: `⚠️ Detected concern: ${sentiment.keywords.join(', ')}`,
        severity: sentiment.severity,
        status: 'monitoring' 
      };
    }

    // Step 1: Retrieve RAG context
    yield { type: 'status', message: '🔍 Searching knowledge base...', status: 'searching' };
    
    const relevantChunks = await retrieveRelevantChunks(userQuestion, 3);
    const context = relevantChunks
      .map((chunk, idx) => `[Context ${idx + 1}]:\n${chunk.content}`)
      .join("\n\n");

    yield { 
      type: 'status', 
      message: `📚 Found ${relevantChunks.length} relevant documents`, 
      status: 'found_context' 
    };

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
6. If customer seems frustrated or explicitly asks for human help, use the escalate_to_human tool
${threadId ? `7. When escalating, pass this threadId: ${threadId}` : ''}

${context ? `KNOWLEDGE BASE:\n${context}` : 'Knowledge base is currently empty.'}

Remember: Use tools for live data (orders, products), use context for policies and info. Escalate when needed.`;

    // Step 3: Build messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userQuestion },
    ];

    // Step 4: First LLM call - detect if tools needed
    yield { type: 'status', message: '🤖 AI is thinking...', status: 'thinking' };
    
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
    let toolResults = [];
    
    // Step 5: Execute tools if requested
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      yield { 
        type: 'status', 
        message: `🛠️ Using ${assistantMessage.tool_calls.length} tool(s)...`, 
        status: 'tool_execution' 
      };
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        // Show which specific tool is running
        const displayName = getToolDisplayName(toolName);
        yield { 
          type: 'tool_start', 
          message: `⚙️ ${displayName}...`,
          tool: toolName,
          args: toolArgs,
          status: 'executing' 
        };
        
        // Execute tool with userId for authentication
        const result = await executeTool(toolName, toolArgs, userId);
        const parsedResult = JSON.parse(result);
        
        toolResults.push({
          tool: toolName,
          args: toolArgs,
          result: parsedResult
        });

        yield { 
          type: 'tool_complete', 
          message: `✓ ${displayName} completed`,
          tool: toolName,
          result: parsedResult,
          status: 'completed' 
        };

        // Add to conversation for next LLM call
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

      // Step 6: Final response with tool results
      yield { type: 'status', message: '💬 Generating response...', status: 'generating' };
      
      completion = await cerebras.chat.completions.create({
        messages,
        model: "llama-3.3-70b",
        max_tokens: 800,
        temperature: 0.2,
      });

      assistantMessage = completion.choices[0].message;
    }

    // Step 7: Stream the final answer word by word
    yield { type: 'answer_start', status: 'streaming' };
    
    const answer = assistantMessage.content;
    const words = answer.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      yield { 
        type: 'answer_chunk', 
        content: word,
        status: 'streaming' 
      };
      // Small delay for streaming effect (adjust as needed)
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Step 8: Send final metadata
    yield { 
      type: 'complete',
      answer: answer,
      sources: relevantChunks.map(chunk => ({
        content: chunk.content.substring(0, 150) + "...",
        relevance: (chunk.score * 100).toFixed(1) + "%",
      })),
      toolsUsed: toolResults.length > 0 ? toolResults : null,
      model: "llama-3.3-70b",
      timestamp: new Date().toISOString(),
      status: 'done'
    };

  } catch (error) {
    console.error("❌ Error in stream:", error);
    yield { 
      type: 'error', 
      message: error.message,
      status: 'error' 
    };
  }
}
