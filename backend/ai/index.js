/**
 * AI Module - Main Entry Point
 * 
 * Agentic AI System for E-commerce Support
 * 
 * Features:
 * - Intent classification via function calling
 * - Hybrid RAG + live MERN database operations
 * - Sentiment-driven escalation with context-rich briefings
 * - Sub-2-second response optimization
 * 
 * Tech Stack:
 * - Cerebras (Llama-3.3-70b) for LLM
 * - MongoDB Vector DB for RAG
 * - Cohere embeddings
 * - LangGraph for agent orchestration
 * - Zod for schema validation
 */

// Configuration
export { default as config, validateConfig } from "./config/index.js";
export * from "./config/prompts.js";
export * from "./config/constants.js";

// Core
export * from "./core/index.js";

// Agent
export * from "./agents/index.js";

// Tools
export * from "./tools/index.js";

// RAG
export * from "./rag/index.js";

// Memory
export * from "./memory/index.js";

// Routes
export { chatRouter, streamingRouter } from "./routes/index.js";

// Utility re-exports for convenience
import { execute, streamExecution, createSupportAgent } from "./agents/index.js";
import { allTools, executeTool } from "./tools/index.js";
import { retrieveRelevantChunks, ingestFromUploads } from "./rag/index.js";
import { MemoryService, generateThreadId } from "./memory/index.js";

export default {
  // Agent
  execute,
  streamExecution,
  createSupportAgent,
  
  // Tools
  allTools,
  executeTool,
  
  // RAG
  retrieveRelevantChunks,
  ingestFromUploads,
  
  // Memory
  MemoryService,
  generateThreadId,
};
