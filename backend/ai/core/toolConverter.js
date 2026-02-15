/**
 * Tool Converter
 * Converts LangChain tools (Zod schemas) to OpenAI/Cerebras function format
 */

/**
 * Convert a Zod schema to JSON Schema
 * @param {Object} zodSchema - Zod schema object
 */
function zodToJsonSchema(zodSchema) {
  const typeName = zodSchema._def.typeName;

  switch (typeName) {
    case "ZodString":
      return {
        type: "string",
        description: zodSchema.description || "",
      };

    case "ZodNumber":
      return {
        type: "number",
        description: zodSchema.description || "",
      };

    case "ZodBoolean":
      return {
        type: "boolean",
        description: zodSchema.description || "",
      };

    case "ZodEnum":
      return {
        type: "string",
        enum: zodSchema._def.values,
        description: zodSchema.description || "",
      };

    case "ZodOptional":
      return zodToJsonSchema(zodSchema._def.innerType);

    case "ZodDefault":
      const innerSchema = zodToJsonSchema(zodSchema._def.innerType);
      innerSchema.default = zodSchema._def.defaultValue();
      return innerSchema;

    default:
      return { type: "string" };
  }
}

/**
 * Convert a LangChain tool to Cerebras/OpenAI function format
 * @param {Object} tool - LangChain tool with name, description, and schema
 */
export function convertTool(tool) {
  const parameters = {
    type: "object",
    properties: {},
    required: [],
  };

  Object.entries(tool.schema.shape).forEach(([key, zodSchema]) => {
    parameters.properties[key] = zodToJsonSchema(zodSchema);

    // Check if required (not optional)
    if (!zodSchema.isOptional()) {
      parameters.required.push(key);
    }
  });

  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters,
    },
  };
}

/**
 * Convert multiple LangChain tools to Cerebras/OpenAI format
 * @param {Array} tools - Array of LangChain tools
 */
export function convertTools(tools) {
  return tools.map(convertTool);
}

export default {
  convertTool,
  convertTools,
};
