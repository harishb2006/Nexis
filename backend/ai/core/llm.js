/**
 * LLM Client
 * Cerebras LLM integration with optimized configuration
 */
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import config from "../config/index.js";

// Singleton client instance
let clientInstance = null;

/**
 * Get or create the Cerebras client
 */
export function getClient() {
  if (!clientInstance) {
    if (!config.llm.apiKey) {
      throw new Error("CEREBRAS_API_KEY is not configured");
    }
    clientInstance = new Cerebras({
      apiKey: config.llm.apiKey,
    });
  }
  return clientInstance;
}

/**
 * Generate a chat completion
 * @param {Array} messages - Array of {role, content} messages
 * @param {Object} options - Optional overrides
 */
export async function complete(messages, options = {}) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    messages,
    model: options.model || config.llm.model,
    max_tokens: options.maxTokens || config.llm.maxTokens,
    temperature: options.temperature || config.llm.temperature,
    ...(options.tools && { tools: options.tools }),
    ...(options.toolChoice && { tool_choice: options.toolChoice }),
  });

  return completion;
}

/**
 * Generate a chat completion with tools
 * @param {Array} messages - Array of {role, content} messages
 * @param {Array} tools - Array of tool definitions
 * @param {Object} options - Optional overrides
 */
export async function completeWithTools(messages, tools, options = {}) {
  return complete(messages, {
    ...options,
    tools,
    toolChoice: options.toolChoice || "auto",
  });
}

export default {
  getClient,
  complete,
  completeWithTools,
};
