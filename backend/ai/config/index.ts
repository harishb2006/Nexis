/**
 * AI Module Configuration
 * Central configuration for all AI services
 */
import dotenv from "dotenv";

dotenv.config();

export const config = {
  // LLM Configuration
  llm: {
    provider: "groq",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    groq: {
      baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "mistral:7b",
    },
    maxTokens: parseInt(process.env.MAX_TOKENS) || 800,
    temperature: parseFloat(process.env.TEMPERATURE) || 0.2,
  },

  // Embeddings Configuration
  embeddings: {
    provider: "cohere",
    model: "embed-english-v3.0",
    apiKey: process.env.COHERE_API_KEY,
    dimensions: 1024,
  },

  // RAG Configuration
  rag: {
    chunkSize: 512,
    chunkOverlap: 50,
    topK: 3,
    minRelevanceScore: 0.5,
  },

  // Agent Configuration
  agent: {
    maxIterations: 3,
    streamDelay: 30, // ms between word chunks
  },

  // Database
  database: {
    url: process.env.DB_URL,
  },
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const required = [
    { key: "GROQ_API_KEY", value: config.llm.groq.apiKey },
    { key: "COHERE_API_KEY", value: config.embeddings.apiKey },
    { key: "DB_URL", value: config.database.url },
  ];

  const missing = required.filter((r) => !r.value);

  if (missing.length > 0) {
    return false;
  }

  return true;
}

export default config;
