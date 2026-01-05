# RAG System for AI Chatbot

This folder contains the Retrieval Augmented Generation (RAG) system for the AI chatbot.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install openai pdf-parse
```

### 2. Environment Variables

Add these to your `backend/.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

The MongoDB connection (`DB_URL`) is already configured.

### 3. Create Vector Search Index in MongoDB

You need to create a vector search index in MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Navigate to your cluster → Browse Collections
3. Select database: `ai_store`, collection: `knowledge_base`
4. Go to "Search Indexes" tab
5. Click "Create Search Index"
6. Choose "JSON Editor"
7. Paste this configuration:

```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

8. Name the index: `default`
9. Click "Create"

## Usage

### Ingest Documents

Add your documents to the `rag/data/` folder, then run:

```bash
# From backend directory
node rag/ingest.js rag/data/Shipping.txt

# Or ingest a PDF
node rag/ingest.js rag/data/policies.pdf
```

### Test Retrieval

```bash
node rag/retriever.js "How does shipping work?"
```

### Use in Your Code

```javascript
import { retrieveRelevantChunks, searchKnowledgeBase } from './rag/retriever.js';

// Get relevant chunks
const chunks = await retrieveRelevantChunks("your question", 3);

// Or get formatted context
const context = await searchKnowledgeBase("your question", 3);
```

## File Structure

```
rag/
├── ingest.js          # Document ingestion script
├── retriever.js       # Vector search and retrieval
├── data/              # Place your documents here
│   └── Shipping.txt   # Example document
└── README.md          # This file
```

## Supported File Types

- `.txt` - Plain text files
- `.pdf` - PDF documents

## Next Steps

1. Create a chatbot controller that uses the retriever
2. Add an API endpoint for the chatbot
3. Integrate with OpenAI's chat completion API
4. Add more documents to your knowledge base
