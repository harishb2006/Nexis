import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import { retrieveRelevantChunks } from "./retriever.js";
import dotenv from "dotenv";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

dotenv.config();

// Initialize Cerebras client
const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Define Langchain prompt template
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `You are a helpful customer support assistant for an e-commerce store called ShopHub.

Your job is to answer customer questions using ONLY the information provided in the context below. 

IMPORTANT RULES:
- Only answer based on the provided context
- If the context doesn't contain the answer, say "I don't have that information in our knowledge base. Please contact our support team at support@shophub.com"
- Be friendly, concise, and helpful
- Don't make up information
- Format your answers clearly with bullet points when listing multiple items

CONTEXT:
{context}

Remember: Only use the information from the context above to answer questions.`],
  ["human", "{question}"]
]);

const outputParser = new StringOutputParser();

/**
 * Generate AI response using RAG + Cerebras LLM
 * @param {string} userQuestion - User's question
 * @param {Array} conversationHistory - Previous messages (optional)
 * @returns {Promise<Object>} AI response with context
 */
export async function generateAnswer(userQuestion, conversationHistory = []) {
  try {
    // Step 1: Retrieve relevant context from knowledge base using Langchain retriever
    console.log("🔍 Retrieving relevant context...");
    const relevantChunks = await retrieveRelevantChunks(userQuestion, 3);

    // Build context from retrieved chunks
    const context = relevantChunks
      .map((chunk, idx) => `[Context ${idx + 1}]:\n${chunk.content}`)
      .join("\n\n");

    console.log(`📚 Found ${relevantChunks.length} relevant chunks`);

    // Step 2: Format prompt using Langchain template
    const formattedPrompt = await promptTemplate.format({
      context: context,
      question: userQuestion
    });

    // Step 3: Build message history (still using Cerebras directly for completion)
    const messages = [
      { role: "system", content: formattedPrompt },
      ...conversationHistory,
      { role: "user", content: userQuestion },
    ];

    // Step 4: Generate response using Cerebras
    console.log("🤖 Generating AI response with Cerebras...");
    const completion = await cerebras.chat.completions.create({
      messages,
      model: "llama-3.3-70b",
      max_tokens: 500,
      temperature: 0.2,
      top_p: 1,
      stream: false,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log("✅ Response generated successfully");

    return {
      answer: aiResponse,
      sources: relevantChunks.map((chunk) => ({
        content: chunk.content.substring(0, 150) + "...",
        relevance: (chunk.score * 100).toFixed(1) + "%",
      })),
      model: "llama-3.3-70b",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error generating answer:", error.message);
    throw error;
  }
}

/**
 * Simple chat function for testing
 * @param {string} question - User question
 * @returns {Promise<string>} AI answer
 */
export async function chat(question) {
  const result = await generateAnswer(question);
  return result.answer;
}

// Test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testQuestion = process.argv[2] || "How does shipping work?";

  console.log("🧪 Testing RAG + Cerebras Chatbot\n");
  console.log("=" . repeat(60));
  console.log(`Question: ${testQuestion}\n`);

  generateAnswer(testQuestion)
    .then((result) => {
      console.log("\n📝 AI Answer:\n");
      console.log(result.answer);
      console.log("\n📚 Sources Used:");
      result.sources.forEach((source, idx) => {
        console.log(`\n${idx + 1}. (${source.relevance} relevant)`);
        console.log(`   ${source.content}`);
      });
      console.log("\n" + "=".repeat(60));
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Test failed:", err.message);
      process.exit(1);
    });
}
