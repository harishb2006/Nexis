# 📚 Nexis AI Documentation - Complete Guide

## Overview
Your e-commerce application now has a fully functional AI chatbot that answers questions **only from documents you upload**. All AI features are cleanly organized in dedicated folders.

---

## 🏗️ Architecture

### Backend Structure
```
backend/
├── ai/                              # 🤖 All AI features here
│   ├── models/
│   │   └── knowledgeBase.js         # MongoDB schema for embeddings
│   ├── services/
│   │   ├── documentIngestion.js     # Scan & ingest from uploads/
│   │   ├── retriever.js             # Semantic search
│   │   └── chatService.js           # RAG + LLM logic
│   ├── controllers/
│   │   └── chat.js                  # API endpoints
│   └── README.md
├── uploads/                          # 📂 Drop your documents here
│   └── Harish Declaration form.pdf  # Currently ingested
└── ...
```

### Frontend Structure
```
frontend/src/
├── features/
│   └── ai/                          # 🤖 All AI features here
│       ├── components/
│       │   └── Chatbot.jsx          # Floating chat UI
│       └── README.md
└── ...
```

---

## 🚀 Quick Start

### 1. Add Documents
Place any `.txt`, `.pdf`, or `.md` file in `/backend/uploads/`:
```bash
cp your-document.pdf backend/uploads/
```

### 2. Ingest Documents
Run the ingestion script:
```bash
cd backend
npm run ingest
```

**Output:**
```
🤖 AI Document Ingestion System
✅ Connected to MongoDB
📚 Found 1 document(s):
   1. Harish Declaration form.pdf
📄 Processing: Harish Declaration form.pdf
   🔹 Chunks: 29
   ✅ Ingested 29 chunks
🎉 Ingestion complete!
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test the Chatbot
Open your frontend and click the orange chat button in the bottom-right corner!

---

## 🔌 API Endpoints

### 1. Ask Question
```http
POST /api/v2/chat/ask
Content-Type: application/json

{
  "question": "What is this document about?",
  "history": []  // optional
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Based on the document...",
  "sources": [
    {
      "content": "relevant chunk",
      "score": 0.85
    }
  ]
}
```

### 2. Trigger Ingestion (NEW!)
```http
POST /api/v2/chat/ingest
```

**Response:**
```json
{
  "success": true,
  "message": "Document ingestion completed successfully"
}
```

### 3. Health Check
```http
GET /api/v2/chat/health
```

### 4. Get Suggestions
```http
GET /api/v2/chat/suggestions
```

---

## 🧠 How It Works (RAG System)

### Step 1: Document Ingestion
```
📄 Document (.pdf, .txt, .md)
    ↓
🔪 Split into chunks (512 chars, 50 overlap)
    ↓
🧮 Generate embeddings (Cohere embed-english-v3.0)
    ↓
💾 Store in MongoDB (1024-dimensional vectors)
```

### Step 2: Question Answering
```
❓ User Question
    ↓
🧮 Generate question embedding (Cohere)
    ↓
🔍 Search similar chunks (Cosine similarity)
    ↓
📝 Build context from top 3 chunks
    ↓
🤖 Generate answer (Cerebras llama-3.3-70b)
    ↓
💬 Return to user
```

---

## ⚙️ Configuration

### Environment Variables
Located in `/backend/.env`:
```env
# AI Services
COHERE_API_KEY=3K9Jr2FbJWRJJQInYTVcp8dcx8CpCOAJSSS1ojGa
CEREBRAS_API_KEY=csk-c9ckjxx3t2nkdyvk2mvf3fe6tfrj4hp4ec5fj6jmr8pe32ey

# Database
DB_URL=mongodb+srv://imharishba:Ecom@cluster0.sa0fz.mongodb.net/

# Server
PORT=8000
```

### Embedding Model
- **Provider:** Cohere
- **Model:** embed-english-v3.0
- **Dimensions:** 1024
- **Input Type:** search_document/search_query

### LLM Model
- **Provider:** Cerebras
- **Model:** llama-3.3-70b
- **Max Tokens:** 500
- **Temperature:** 0.2

---

## 🛠️ Customization

### Change Chunk Size
Edit `/backend/ai/services/documentIngestion.js`:
```javascript
const chunks = chunkText(text, 512, 50);
//                             ↑    ↑
//                        size  overlap
```

### Change Retrieval Count
Edit `/backend/ai/services/retriever.js`:
```javascript
export async function retrieveRelevantChunks(query, k = 3) {
//                                                    ↑
//                                          return top 3 chunks
```

### Modify Chatbot UI
Edit `/frontend/src/features/ai/components/Chatbot.jsx`:
- Colors: Search for `bg-gradient-to-br from-orange-500`
- Size: Change `w-96 h-[500px]`
- Initial message: Update `useState` initial message

### Change LLM Parameters
Edit `/backend/ai/services/chatService.js`:
```javascript
const response = await cerebras.chat.completions.create({
  model: "llama-3.3-70b",
  max_tokens: 500,      // ← Adjust response length
  temperature: 0.2,     // ← Adjust creativity (0-1)
});
```

---

## 🐛 Troubleshooting

### Rate Limit Error (429)
```
TooManyRequestsError: Please wait and try again later
```
**Solution:** Wait 2-3 minutes. Cohere free tier has rate limits.

### No Documents Found
```
⚠️  No documents found in uploads folder
```
**Solution:** Add `.txt`, `.pdf`, or `.md` files to `/backend/uploads/`

### Import Errors
**Problem:** Module not found errors
**Solution:** Check file paths match new structure:
- Backend: `ai/services/`, `ai/controllers/`, `ai/models/`
- Frontend: `features/ai/components/`

### MongoDB Connection Issues
**Problem:** Cannot connect to database
**Solution:** Check `DB_URL` in `.env` file

---

## 📊 Monitoring

### Check Knowledge Base
```javascript
// In MongoDB Compass or Shell
db.knowledgebases.countDocuments()  // Total chunks
db.knowledgebases.find({ source: { $regex: /Harish/ } })  // Specific doc
```

### Test Retrieval
```bash
node ai/services/retriever.js "your test question"
```

### View Server Logs
```bash
npm run dev
# Watch for:
# - ✅ MongoDB connected
# - Chat request received
# - Retrieved X context chunks
```

---

## 🔒 Security Notes

1. **API Keys:** Never commit `.env` to git
2. **Uploads Folder:** Validate file types before ingestion
3. **Rate Limits:** Implement request throttling in production
4. **CORS:** Currently allows `localhost:5173` - update for production

---

## 📈 Next Steps

### Recommended Enhancements
1. **Auto-ingestion:** Watch uploads folder for new files
2. **File management UI:** Upload documents from frontend
3. **Conversation history:** Persist chat sessions
4. **Multi-user support:** Separate knowledge bases per user
5. **Caching:** Cache embeddings to reduce API calls
6. **Fallback responses:** Handle when no relevant docs found

### Scaling
- **Vector DB:** Migrate to Pinecone/Weaviate for large datasets
- **Batch processing:** Queue system for multiple documents
- **CDN:** Serve static files from CDN
- **Load balancing:** Multiple server instances

---

## 📞 Support

### Common Commands
```bash
# Ingest documents
npm run ingest

# Start development server
npm run dev

# Start production server
npm start

# Old ingestion (static file)
npm run ingest:old
```

### Useful Paths
- Backend AI: `/backend/ai/`
- Frontend AI: `/frontend/src/features/ai/`
- Documents: `/backend/uploads/`
- Logs: Check terminal running `npm run dev`

---

**🎉 You're all set! Drop documents in uploads/ and start chatting!**
