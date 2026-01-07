import mongoose from "mongoose";
import dotenv from "dotenv";
import { CohereEmbeddings } from "@langchain/cohere";
import KnowledgeBase from '../models/knowledgeBase.js';

dotenv.config();

// Initialize Langchain Cohere embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-english-v3.0",
  inputType: "search_query"
});

const MONGO_URI = process.env.DB_URL;

/**
 * Connect to MongoDB
 */
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity score (0 to 1)
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Retrieve relevant chunks from knowledge base using vector search
 * @param {string} query - User query to search for
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} Array of relevant chunks with scores
 */
export async function retrieveRelevantChunks(query, k = 3) {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not set in environment variables");
  }

  await connectDB();

  try {
    // 1. Create embedding for the user query using Langchain Cohere embeddings
    console.log(`🔍 Searching for: "${query}"`);
    
    const queryVector = await embeddings.embedQuery(query);
    console.log(`📊 Query embedding created (${queryVector.length} dimensions)`);

    // 2. Retrieve all documents from knowledge base
    const allDocs = await KnowledgeBase.find({}).lean();
    
    if (allDocs.length === 0) {
      console.log("⚠️  Knowledge base is empty. Please run ingestion first.");
      return [];
    }

    console.log(`📚 Comparing against ${allDocs.length} chunks...`);

    // 3. Calculate similarity scores
    const results = allDocs.map(doc => ({
      content: doc.content,
      source: doc.source,
      score: cosineSimilarity(queryVector, doc.embedding),
      metadata: doc.metadata
    }));

    // 4. Sort by score and return top k
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, k);

    console.log(`✅ Found ${topResults.length} relevant chunks`);
    topResults.forEach((result, idx) => {
      console.log(`   ${idx + 1}. Score: ${result.score.toFixed(4)} - ${result.content.substring(0, 60)}...`);
    });
    
    return topResults;
  } catch (error) {
    console.error("❌ Error during retrieval:", error.message);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeConnection() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

/**
 * Search and format results for display
 * @param {string} query - Search query
 * @param {number} k - Number of results
 * @returns {Promise<string>} Formatted context string
 */
export async function searchKnowledgeBase(query, k = 3) {
  const results = await retrieveRelevantChunks(query, k);
  
  if (results.length === 0) {
    return "No relevant information found in the knowledge base.";
  }

  // Combine chunks into context
  const context = results
    .map((result, idx) => {
      return `[Chunk ${idx + 1}] (Relevance: ${(result.score * 100).toFixed(1)}%)\n${result.content}`;
    })
    .join("\n\n---\n\n");

  return context;
}

/**
 * Search and get structured results (for API use)
 * @param {string} query - Search query
 * @param {number} k - Number of results
 * @returns {Promise<Object>} Structured search results
 */
export async function search(query, k = 3) {
  const results = await retrieveRelevantChunks(query, k);
  
  return {
    query,
    totalResults: results.length,
    results: results.map((result, idx) => ({
      rank: idx + 1,
      content: result.content,
      score: result.score,
      relevancePercentage: (result.score * 100).toFixed(2),
      source: result.source
    }))
  };
}

// Test retrieval if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testQuery = process.argv[2] || "How does shipping work?";
  
  console.log("🧪 Testing RAG Retrieval System\n");
  console.log("=" . repeat(60));
  
  searchKnowledgeBase(testQuery)
    .then((context) => {
      console.log("\n📝 Retrieved Context:\n");
      console.log(context);
      console.log("\n" + "=".repeat(60));
      return closeConnection();
    })
    .then(() => {
      console.log("\n✅ Test completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Test failed:", err.message);
      closeConnection().then(() => process.exit(1));
    });
}
