/**
 * LLM Client
 * Groq LLM integration with Ollama fallback
 */
import { Ollama } from "ollama";
import config from "../config/index.js";

// Singleton client instance
let clientInstance = null;

/**
 * Get or create the Ollama client
 */
export function getOllamaClient() {
  if (!clientInstance) {
    if (!config.llm.ollama.baseUrl) {
      throw new Error("OLLAMA_BASE_URL is not configured");
    }
    clientInstance = new Ollama({
      host: config.llm.ollama.baseUrl,
    });
  }
  return clientInstance;
}

/**
 * Generate a chat completion using Ollama
 */
export async function completeWithOllama(messages, options = {}) {
  const client = getOllamaClient();

  const response = await client.chat({
    model: options.model || config.llm.ollama.model,
    messages,
    stream: options.stream || false,
    options: {
      temperature: options.temperature || config.llm.temperature,
      num_predict: options.maxTokens || config.llm.maxTokens,
    },
    ...(options.tools && !options.stream && { tools: options.tools }),
  });

  if (options.stream) {
    // Return the async iterable directly compatible with OpenAI stream iteration
    return response;
  }

  // Debug logging
  console.log('🔍 Ollama Response:', JSON.stringify(response, null, 2));

  // Convert Ollama response format to OpenAI-compatible format
  return {
    choices: [
      {
        message: {
          role: response.message.role,
          content: response.message.content,
          ...(response.message.tool_calls && {
            tool_calls: response.message.tool_calls,
          }),
        },
        finish_reason: response.done ? "stop" : "length",
      },
    ],
  };
}

/**
 * Generate a chat completion using Groq
 */
export async function completeWithGroq(messages, options = {}) {
  const url = `${config.llm.groq.baseUrl}/chat/completions`;
  const body = {
    model: options.model || config.llm.model,
    messages,
    temperature: options.temperature || config.llm.temperature,
    max_tokens: options.maxTokens || config.llm.maxTokens,
    stream: options.stream || false,
  };

  if (options.tools) {
    body.tools = options.tools;
    if (options.toolChoice) {
      body.tool_choice = options.toolChoice;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.llm.groq.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API Error: ${response.status} ${text}`);
  }

  if (options.stream) {
    return response.body;
  }

  const data = await response.json();
  console.log('🔍 Groq Response:', JSON.stringify(data, null, 2));
  return data;
}

/**
 * Generate a chat completion
 * @param {Array} messages - Array of {role, content} messages
 * @param {Object} options - Optional overrides
 */
export async function complete(messages, options = {}) {
  if (config.llm.provider === 'ollama') {
    try {
      const fallbackOptions = { ...options };
      delete fallbackOptions.model;
      return await completeWithOllama(messages, fallbackOptions);
    } catch (error) {
      console.error("⚠️ Ollama failed:", error.message);
      throw error;
    }
  }

  try {
    return await completeWithGroq(messages, options);
  } catch (error) {
    console.error("⚠️ Groq API failed, falling back to local Ollama (Mistral):", error.message);
    const fallbackOptions = { ...options };
    delete fallbackOptions.model;
    return await completeWithOllama(messages, fallbackOptions);
  }
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
  getOllamaClient,
  completeWithOllama,
  completeWithGroq,
  complete,
  completeWithTools,
};
