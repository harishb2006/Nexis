/**
 * RAG Retriever
 * Vector search and document retrieval
 */
import mongoose from "mongoose";
import { embedQuery, cosineSimilarity } from "../core/embeddings.js";
import KnowledgeBase from "../models/knowledgeBase.js";
import config from "../config/index.js";

/**
 * Connect to MongoDB if not already connected
 */
async function ensureConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.database.url);
  }
}

/**
 * Retrieve relevant chunks from knowledge base using vector search
 * @param {string} query - User query to search for
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} Array of relevant chunks with scores
 */
export async function retrieveRelevantChunks(query, k = 3) {
  if (!config.embeddings.apiKey) {
    throw new Error("COHERE_API_KEY is not set in environment variables");
  }

  await ensureConnection();

  try {
    // Create embedding for the user query
    console.log(`🔍 Searching for: "${query}"`);
    const queryVector = await embedQuery(query);
    console.log(`📊 Query embedding created (${queryVector.length} dimensions)`);

    // Retrieve all documents from knowledge base
    const allDocs = await KnowledgeBase.find({}).lean();

    if (allDocs.length === 0) {
      console.log("⚠️  Knowledge base is empty. Please run ingestion first.");
      return [];
    }

    console.log(`📚 Comparing against ${allDocs.length} chunks...`);

    // Calculate similarity scores
    const results = allDocs.map((doc) => ({
      content: doc.content,
      source: doc.source,
      score: cosineSimilarity(queryVector, doc.embedding),
      metadata: doc.metadata,
    }));

    // Sort by score and return top k
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, k);

    console.log(`✅ Found ${topResults.length} relevant chunks`);
    topResults.forEach((result, idx) => {
      console.log(
        `   ${idx + 1}. Score: ${result.score.toFixed(4)} - ${result.content.substring(0, 60)}...`
      );
    });

    return topResults;
  } catch (error) {
    console.error("❌ Error during retrieval:", error.message);
    throw error;
  }
}

/**
 * Format retrieved chunks as context string
 * @param {Array} chunks - Retrieved chunks
 */
export function formatChunksAsContext(chunks) {
  if (chunks.length === 0) {
    return "";
  }

  return chunks
    .map((chunk, idx) => `[Context ${idx + 1}]:\n${chunk.content}`)
    .join("\n\n");
}

/**
 * Format chunks as sources for response
 * @param {Array} chunks - Retrieved chunks
 */
export function formatChunksAsSources(chunks) {
  return chunks.map((chunk) => ({
    content: chunk.content.substring(0, 150) + "...",
    relevance: (chunk.score * 100).toFixed(1) + "%",
  }));
}

/**
 * Search and format results for display
 * @param {string} query - Search query
 * @param {number} k - Number of results
 */
export async function searchKnowledgeBase(query, k = 3) {
  const results = await retrieveRelevantChunks(query, k);

  if (results.length === 0) {
    return "No relevant information found in the knowledge base.";
  }

  return results
    .map((result, idx) => {
      return `[Chunk ${idx + 1}] (Relevance: ${(result.score * 100).toFixed(1)}%)\n${result.content}`;
    })
    .join("\n\n---\n\n");
}

export default {
  retrieveRelevantChunks,
  formatChunksAsContext,
  formatChunksAsSources,
  searchKnowledgeBase,
};
