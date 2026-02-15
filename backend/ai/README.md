# AI Module - Agentic E-commerce Support System

A well-structured, modular AI system for e-commerce customer support featuring intent classification, function calling, and hybrid RAG operations.

## Architecture Overview

```
ai/
├── index.js                 # Main entry point & exports
├── config/                  # Configuration & constants
│   ├── index.js            # Central configuration
│   ├── prompts.js          # System prompts
│   └── constants.js        # Constants (keywords, tool names)
│
├── core/                    # Core AI components
│   ├── llm.js              # Cerebras LLM client
│   ├── embeddings.js       # Cohere embeddings
│   └── toolConverter.js    # Zod to OpenAI format
│
├── agents/                  # Agent orchestration
│   ├── index.js            # Agent exports
│   └── supportAgent.js     # LangGraph support agent
│
├── tools/                   # Modular tools
│   ├── index.js            # Tool registry
│   ├── orders.js           # Order management tools
│   ├── products.js         # Product search tools
│   └── support.js          # Escalation & refund tools
│
├── rag/                     # Retrieval system
│   ├── retriever.js        # Vector search
│   └── ingestion.js        # Document processing
│
├── memory/                  # Conversation memory
│   ├── model.js            # ChatThread schema
│   └── service.js          # Memory operations
│
├── models/                  # Database models
│   └── knowledgeBase.js    # Knowledge base schema
│
├── routes/                  # API endpoints
│   ├── chat.js             # Non-streaming API
│   └── streaming.js        # SSE streaming API
│
└── utils/                   # Utilities
    ├── database.js         # DB connection helper
    └── sentiment.js        # Sentiment detection
```

## Features

### Intent Classification & Function Calling
- Automatic intent detection via Cerebras LLM
- 8 specialized tools for e-commerce operations
- Zod schema validation for type-safe tool execution

### Hybrid RAG + Live Database
- Knowledge base for FAQs and policies
- Real-time CRUD on MongoDB (orders, products)
- Context-aware response generation

### Sentiment-Driven Escalation
- Real-time sentiment detection
- Automatic escalation triggers
- Context-rich briefings for human agents

### Performance Optimized
- Sub-2-second response times
- Streaming responses via SSE
- Efficient conversation state management

## Available Tools

| Tool | Description |
|------|-------------|
| `check_order` | Check order status and details |
| `get_my_orders` | Get user's order history |
| `get_all_orders` | Admin: list all orders |
| `update_order_status` | Change order status |
| `search_products` | Search products |
| `update_product_stock` | Update inventory |
| `check_refund_eligibility` | Multi-step refund check |
| `escalate_to_human` | Escalate to support team |

## API Endpoints

### Non-Streaming
```
POST /api/v2/chat/ask
Body: { question: string, history?: array, userId?: string, email?: string }
```

### Streaming (SSE)
```
POST /api/v2/chat/stream
Body: { question: string, threadId?: string, userId?: string, email?: string }
```

### Other Endpoints
```
GET  /api/v2/chat/health           # Health check
GET  /api/v2/chat/suggestions      # Get suggested questions
POST /api/v2/chat/ingest           # Ingest documents
GET  /api/v2/chat/thread/:id       # Get conversation history
GET  /api/v2/chat/briefing/:id     # Get escalation briefing
```

## Environment Variables

```env
CEREBRAS_API_KEY=your_api_key
COHERE_API_KEY=your_api_key
DB_URL=mongodb://...
CEREBRAS_MODEL=llama-3.3-70b    # Optional
MAX_TOKENS=800                   # Optional
TEMPERATURE=0.2                  # Optional
```

## Usage

```javascript
import ai from './ai/index.js';

// Non-streaming
const result = await ai.execute("What's my order status?", [], {
  userId: "user123",
  email: "user@example.com"
});

// Streaming
for await (const event of ai.streamExecution("Show my orders", history, options)) {
  console.log(event);
}

// Document ingestion
await ai.ingestFromUploads();
```

## Adding New Tools

1. Create tool in appropriate file (`tools/orders.js`, etc.)
2. Export tool and add to tools array
3. Tool is automatically available to the agent

```javascript
// tools/orders.js
export const newTool = tool(
  async ({ param1 }) => {
    // Implementation
    return JSON.stringify({ success: true, data: result });
  },
  {
    name: "new_tool",
    description: "Description for LLM",
    schema: z.object({
      param1: z.string().describe("Parameter description")
    })
  }
);

export const orderTools = [...existingTools, newTool];
```
