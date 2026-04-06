/**
 * Embeddings Service
 * Cohere embeddings via LangChain
 */
import { CohereEmbeddings } from "@langchain/cohere";
import config from "../config/configMain.js";

// Singleton instances for different input types
let queryEmbeddings = null;
let documentEmbeddings = null;

/**
 * Get embeddings instance for search queries
 */
export function getQueryEmbeddings() {
  if (!queryEmbeddings) {
    if (!config.embeddings.apiKey) {
      throw new Error("COHERE_API_KEY is not configured");
    }
    queryEmbeddings = new CohereEmbeddings({
      apiKey: config.embeddings.apiKey,
      model: config.embeddings.model,
      inputType: "search_query",
    });
  }
  return queryEmbeddings;
}

/**
 * Get embeddings instance for documents
 */
export function getDocumentEmbeddings() {
  if (!documentEmbeddings) {
    if (!config.embeddings.apiKey) {
      throw new Error("COHERE_API_KEY is not configured");
    }
    documentEmbeddings = new CohereEmbeddings({
      apiKey: config.embeddings.apiKey,
      model: config.embeddings.model,
      inputType: "search_document",
    });
  }
  return documentEmbeddings;
}

/**
 * Generate embedding for a single query
 * @param {string} query - Text to embed
 */
export async function embedQuery(query) {
  const embeddings = getQueryEmbeddings();
  return embeddings.embedQuery(query);
}

/**
 * Generate embeddings for multiple documents
 * @param {Array<string>} documents - Array of texts to embed
 */
export async function embedDocuments(documents) {
  const embeddings = getDocumentEmbeddings();
  return embeddings.embedDocuments(documents);
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 */
export function cosineSimilarity(vecA, vecB) {
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

export default {
  getQueryEmbeddings,
  getDocumentEmbeddings,
  embedQuery,
  embedDocuments,
  cosineSimilarity,
};
