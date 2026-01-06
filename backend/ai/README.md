# AI Features - Nexis E-commerce

This directory contains all AI-powered features for the Nexis application.

## Structure

```
ai/
├── models/          # AI-related database models
│   └── knowledgeBase.js  # Vector embeddings storage
├── services/        # AI business logic
│   ├── documentIngestion.js  # Auto-ingest from uploads folder
│   ├── retriever.js          # RAG retrieval system
│   └── chatService.js        # Chatbot service
└── controllers/     # AI API endpoints
    └── chat.js      # Chat routes (/api/v2/chat/*)
```

## Features

### 📚 Document Ingestion
Automatically scans the `/uploads` folder and ingests documents into the knowledge base.

**Supported formats:** `.txt`, `.pdf`, `.md`

**Run ingestion:**
```bash
node ai/services/documentIngestion.js
```

### 🔍 RAG (Retrieval Augmented Generation)
- **Embeddings:** Cohere embed-english-v3.0 (1024 dimensions)
- **LLM:** Cerebras llama-3.3-70b
- **Search:** Cosine similarity

### 💬 Chatbot API
- `POST /api/v2/chat/ask` - Ask questions
- `GET /api/v2/chat/health` - Health check
- `GET /api/v2/chat/suggestions` - Get suggested questions

## Environment Variables

```env
COHERE_API_KEY=your_cohere_key
CEREBRAS_API_KEY=your_cerebras_key
DB_URL=mongodb_connection_string
```

## Usage

1. **Add documents** to `/backend/uploads/` folder
2. **Run ingestion**: `node ai/services/documentIngestion.js`
3. **Chat** via API or frontend chatbot component

The chatbot will only answer questions based on documents in the uploads folder!
