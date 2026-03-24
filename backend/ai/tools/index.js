/**
 * Tool Registry
 * Central registry for all AI tools with execution helpers
 */
import { TOOL_DISPLAY_NAMES } from "../config/constants.js";
import { convertTools } from "../core/toolConverter.js";
import orderTools from "./orders.js";
import productTools from "./products.js";
import supportTools from "./support.js";

/**
 * All available tools
 */
export const allTools = [...orderTools, ...productTools, ...supportTools];

/**
 * Tool lookup map for fast access
 */
const toolMap = new Map(allTools.map((tool) => [tool.name, tool]));

/**
 * Get a tool by name
 * @param {string} name - Tool name
 */
export function getTool(name) {
  return toolMap.get(name);
}

/**
 * Get display name for a tool
 * @param {string} name - Tool name
 */
export function getToolDisplayName(name) {
  return TOOL_DISPLAY_NAMES[name] || name;
}

/**
 * Convert all tools to Cerebras/OpenAI format
 */
export function getToolsForLLM() {
  return convertTools(allTools);
}

/**
 * Execute a tool by name
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {Object} context - Additional context (userId, email, etc.)
 */
export async function executeTool(toolName, args, context = {}) {
  const tool = getTool(toolName);

  if (!tool) {
    return JSON.stringify({
      success: false,
      error: "Tool not found",
      toolName,
    });
  }

  try {
    // Inject context into arguments
    const enhancedArgs = { ...args };
    if (context.userId) enhancedArgs.userId = context.userId;
    if (context.email) enhancedArgs.email = context.email;

    const result = await tool.invoke(enhancedArgs);
    return result;
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message,
      message: "An error occurred while processing your request.",
    });
  }
}

export default {
  allTools,
  getTool,
  getToolDisplayName,
  getToolsForLLM,
  executeTool,
};
