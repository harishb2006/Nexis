/**
 * RAG Retriever
 * Vector search and document retrieval
 */
import mongoose from "mongoose";
import { embedQuery, cosineSimilarity } from "../core/embeddings.js";
import KnowledgeBase from "../models/knowledgeBase.js";
import config from "../config/index.js";

import { getCollection } from "../core/localVectorStore.js";

export async function retrieveRelevantChunks(query, k = 3) {
  if (!config.embeddings.apiKey) {
    throw new Error("COHERE_API_KEY is not set in environment variables");
  }

  try {
    // Create embedding for the user query
    const queryVector = await embedQuery(query);

    const collection = await getCollection();
    const results = await collection.query({
      queryEmbeddings: [queryVector],
      nResults: k,
    });

    if (!results.documents || results.documents[0].length === 0) {
      return [];
    }

    // Map ChromaDB results back to our expected format
    return results.documents[0].map((docContent, idx) => ({
      content: docContent,
      source: results.metadatas[0][idx]?.source || 'Unknown',
      score: 1.0 - (results.distances[0][idx] || 0), // convert distance back to similarity roughly
      metadata: results.metadatas[0][idx] || {},
    }));
  } catch (error) {
    console.error("Error retrieving chunks from Chroma:", error);
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
