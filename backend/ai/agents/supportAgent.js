
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { complete, completeWithTools } from "../core/llm.js";
import {
  retrieveRelevantChunks,
  formatChunksAsContext,
  formatChunksAsSources,
} from "../rag/retriever.js";
import { getToolsForLLM, executeTool, getToolDisplayName } from "../tools/index.js";
import { detectSentiment } from "../utils/sentiment.js";
import { supportAgentPrompt, toolResultPrompt } from "../config/prompts.js";
import config from "../config/index.js";
import { EVENT_TYPES } from "../config/constants.js";

/**
 * Agent State Definition
 */
const AgentState = Annotation.Root({
  // Input
  userQuestion: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  messages: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),

  // Context
  userId: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  email: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  threadId: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),

  // Processing
  context: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  sources: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  sentiment: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({ isNegative: false, keywords: [], severity: "low" }),
  }),
  toolCalls: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  toolResults: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),

  // Output
  finalAnswer: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  eventStream: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),

  // Control
  shouldContinue: Annotation({ reducer: (x, y) => y ?? x, default: () => true }),
  iterationCount: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 }),
});

// ============================================================================
// Agent Nodes
// ============================================================================

/**
 * Node 1: Sentiment Analysis
 * Fast synchronous sentiment detection for escalation monitoring
 */
async function sentimentNode(state) {
  const sentiment = detectSentiment(state.userQuestion);
  const events = [...state.eventStream];

  if (sentiment.isNegative) {
    events.push({
      type: EVENT_TYPES.SENTIMENT_DETECTED,
      message: `⚠️ Detected concern: ${sentiment.keywords.join(", ")}`,
      severity: sentiment.severity,
      status: "monitoring",
    });
  }

  return { sentiment, eventStream: events };
}

/**
 * Node 2: RAG Retrieval
 * Retrieves relevant context from knowledge base
 */
async function ragNode(state) {
  const events = [...state.eventStream];
  events.push({
    type: EVENT_TYPES.STATUS,
    message: "🔍 Searching knowledge base...",
    status: "searching",
  });

  try {
    const chunks = await retrieveRelevantChunks(state.userQuestion, config.rag.topK);
    const context = formatChunksAsContext(chunks);
    const sources = formatChunksAsSources(chunks);

    events.push({
      type: EVENT_TYPES.STATUS,
      message: `📚 Found ${chunks.length} relevant documents`,
      status: "found",
    });

    return { context, sources, eventStream: events };
  } catch (error) {
    events.push({
      type: EVENT_TYPES.STATUS,
      message: "⚠️ Knowledge base unavailable",
      status: "warning",
    });
    return { context: "", sources: [], eventStream: events };
  }
}

/**
 * Node 3: LLM Decision
 * Determines if tools are needed and which to use
 */
async function decisionNode(state) {
  const events = [...state.eventStream];
  events.push({
    type: EVENT_TYPES.STATUS,
    message: "🤖 AI analyzing request...",
    status: "thinking",
  });

  // Build system prompt
  const systemPrompt = supportAgentPrompt(state.context, state.threadId);

  // Clean message history
  const cleanMessages = (state.messages || [])
    .filter((msg) => msg && msg.role && ["user", "assistant", "system"].includes(msg.role))
    .map((msg) => ({
      role: msg.role,
      content: typeof msg.content === "string" && msg.content ? msg.content : "[empty]",
    }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...cleanMessages,
    { role: "user", content: state.userQuestion },
  ];

  try {
    const tools = getToolsForLLM();
    const completion = await completeWithTools(messages, tools);
    const assistantMessage = completion.choices[0].message;

    // Check if tools are needed
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      events.push({
        type: EVENT_TYPES.STATUS,
        message: `🛠️ Using ${assistantMessage.tool_calls.length} tool(s)...`,
        status: "executing",
      });

      return {
        toolCalls: assistantMessage.tool_calls,
        eventStream: events,
        shouldContinue: true,
      };
    }

    // No tools needed - direct response
    return {
      finalAnswer: assistantMessage.content,
      messages: [
        ...state.messages,
        { role: "user", content: state.userQuestion },
        { role: "assistant", content: assistantMessage.content },
      ],
      eventStream: events,
      shouldContinue: false,
    };
  } catch (error) {
    console.error("❌ Decision Node Error:", error);
    events.push({
      type: EVENT_TYPES.ERROR,
      message: "❌ AI service error",
      status: "error",
    });

    return {
      finalAnswer: "I apologize, but I'm having trouble processing your request. Please try again.",
      eventStream: events,
      shouldContinue: false,
    };
  }
}

/**
 * Node 4: Tool Execution
 * Executes requested tools with user context
 */
async function toolNode(state) {
  const events = [...state.eventStream];
  const toolResults = [];

  for (const toolCall of state.toolCalls) {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);
    const displayName = getToolDisplayName(toolName);

    events.push({
      type: EVENT_TYPES.TOOL_START,
      message: `⚙️ ${displayName}...`,
      tool: toolName,
      status: "executing",
    });

    try {
      const result = await executeTool(toolName, toolArgs, {
        userId: state.userId,
        email: state.email,
      });
      const parsedResult = JSON.parse(result);

      events.push({
        type: EVENT_TYPES.TOOL_COMPLETE,
        message: `✅ ${displayName} completed`,
        tool: toolName,
        success: parsedResult.success !== false,
        status: "completed",
      });

      toolResults.push({ tool: toolName, args: toolArgs, result: parsedResult });
    } catch (error) {

      events.push({
        type: EVENT_TYPES.TOOL_ERROR,
        message: `❌ ${displayName} failed`,
        tool: toolName,
        status: "error",
      });

      toolResults.push({
        tool: toolName,
        args: toolArgs,
        result: { success: false, error: error.message },
      });
    }
  }

  return {
    toolResults,
    eventStream: events,
    iterationCount: state.iterationCount + 1,
  };
}

/**
 * Node 5: Response Generation
 * Generates final response incorporating tool results
 */
async function responseNode(state) {
  const events = [...state.eventStream];
  events.push({
    type: EVENT_TYPES.STATUS,
    message: "💬 Generating response...",
    status: "generating",
  });

  try {
    // Build messages with tool results
    const messages = (state.messages || [])
      .filter((msg) => msg && msg.role && ["user", "assistant", "system"].includes(msg.role))
      .map((msg) => ({
        role: msg.role,
        content: typeof msg.content === "string" && msg.content ? msg.content : "",
      }));

    // Add tool results as context
    if (state.toolResults && state.toolResults.length > 0) {
      const toolContext = state.toolResults
        .map((tr) => `Tool ${tr.tool} returned: ${JSON.stringify(tr.result)}`)
        .join("\n");

      messages.push({
        role: "user",
        content: `Based on the tool results:\n${toolContext}\n\n${toolResultPrompt}`,
      });
    }

    const completion = await complete(messages);
    const assistantMessage = completion.choices[0].message;

    events.push({
      type: EVENT_TYPES.STATUS,
      message: "✅ Response ready",
      status: "complete",
    });

    return {
      finalAnswer: assistantMessage.content,
      messages: [
        ...state.messages,
        { role: "user", content: state.userQuestion },
        { role: "assistant", content: assistantMessage.content },
      ],
      eventStream: events,
      shouldContinue: false,
    };
  } catch (error) {

    return {
      finalAnswer: "I've gathered the information, but I'm having trouble formulating a response. Please try again.",
      eventStream: events,
      shouldContinue: false,
    };
  }
}

// ============================================================================
// Graph Construction
// ============================================================================

/**
 * Conditional: Should execute tools?
 */
function shouldExecuteTools(state) {
  if (state.toolCalls && state.toolCalls.length > 0 && state.shouldContinue) {
    if (state.iterationCount >= config.agent.maxIterations) {
      return "end";
    }
    return "execute_tools";
  }
  return "end";
}

/**
 * Conditional: After tool execution
 */
function afterToolExecution() {
  return "generate_response";
}

/**
 * Build the LangGraph agent
 */
export function createSupportAgent() {
  const workflow = new StateGraph(AgentState);

  // Add nodes
  workflow.addNode("analyze_sentiment", sentimentNode);
  workflow.addNode("retrieve_context", ragNode);
  workflow.addNode("make_decision", decisionNode);
  workflow.addNode("execute_tools", toolNode);
  workflow.addNode("generate_response", responseNode);

  // Define edges
  workflow.addEdge(START, "analyze_sentiment");
  workflow.addEdge("analyze_sentiment", "retrieve_context");
  workflow.addEdge("retrieve_context", "make_decision");

  workflow.addConditionalEdges("make_decision", shouldExecuteTools, {
    execute_tools: "execute_tools",
    end: END,
  });

  workflow.addConditionalEdges("execute_tools", afterToolExecution, {
    generate_response: "generate_response",
  });

  workflow.addEdge("generate_response", END);

  return workflow.compile();
}

// ============================================================================
// Execution Functions
// ============================================================================

/**
 * Stream agent execution with events
 * @param {string} userQuestion - User's question
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} options - Additional options (threadId, userId, email)
 */
export async function* streamExecution(userQuestion, conversationHistory = [], options = {}) {
  const { threadId = null, userId = null, email = null } = options;

  const graph = createSupportAgent();

  const initialState = {
    userQuestion,
    messages: conversationHistory,
    threadId,
    userId,
    email,
    eventStream: [],
    iterationCount: 0,
  };

  try {
    const stream = await graph.stream(initialState, { streamMode: "values" });

    let lastState = null;
    let lastEventCount = 0;

    for await (const state of stream) {
      lastState = state;

      // Yield only new events
      if (state.eventStream && state.eventStream.length > lastEventCount) {
        const newEvents = state.eventStream.slice(lastEventCount);
        for (const event of newEvents) {
          yield event;
        }
        lastEventCount = state.eventStream.length;
      }
    }

    // Final result
    if (lastState) {
      const finalAnswer = lastState.finalAnswer || "I apologize, but I couldn't generate a response.";

      yield { type: EVENT_TYPES.ANSWER_START };

      const words = finalAnswer.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield {
          type: EVENT_TYPES.ANSWER_CHUNK,
          content: words[i] + (i < words.length - 1 ? ' ' : '')
        };
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      yield {
        type: EVENT_TYPES.COMPLETE,
        answer: finalAnswer,
        sources: lastState.sources || [],
        toolsUsed: lastState.toolResults || [],
        sentiment: lastState.sentiment,
        status: "complete",
      };
    }
  } catch (error) {
    console.error("❌ Stream Execution Error:", error);
    yield {
      type: EVENT_TYPES.ERROR,
      message: "An error occurred during processing",
      error: error.message,
      status: "error",
    };
  }
}

/**
 * Execute agent (non-streaming)
 * @param {string} userQuestion - User's question
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} options - Additional options
 */
export async function execute(userQuestion, conversationHistory = [], options = {}) {
  const events = [];
  let finalResult = null;

  for await (const event of streamExecution(userQuestion, conversationHistory, options)) {
    if (event.type === EVENT_TYPES.COMPLETE) {
      finalResult = event;
    } else {
      events.push(event);
    }
  }

  return {
    ...finalResult,
    events,
    model: config.llm.model,
    timestamp: new Date().toISOString(),
  };
}

export default {
  createSupportAgent,
  streamExecution,
  execute,
};
