# 🎯 Nexis AI - Quick Reference Card

## 📁 File Locations

### Backend AI Files
```
backend/ai/
├── models/knowledgeBase.js           # Vector DB schema
├── services/documentIngestion.js     # Upload scanner
├── services/retriever.js             # Search engine
├── services/chatService.js           # RAG logic
└── controllers/chat.js               # API routes
```

### Frontend AI Files
```
frontend/src/features/ai/
└── components/Chatbot.jsx            # Chat UI
```

### Document Storage
```
backend/uploads/                      # DROP FILES HERE
└── *.pdf, *.txt, *.md               # Auto-ingested
```

---

## ⚡ Commands

```bash
# Ingest uploaded documents
cd backend && npm run ingest

# Start backend server
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v2/chat/ask` | Ask question |
| `POST` | `/api/v2/chat/ingest` | Trigger ingestion |
| `GET` | `/api/v2/chat/health` | Health check |
| `GET` | `/api/v2/chat/suggestions` | Get suggestions |

---

## 📊 Current Setup

**Ingested Document:**
- `Harish Declaration form.pdf`
- 29 chunks
- 1024-dimensional embeddings

**AI Stack:**
- Embeddings: Cohere `embed-english-v3.0`
- LLM: Cerebras `llama-3.3-70b`
- Database: MongoDB Atlas
- Search: Cosine similarity

**Server:**
- Port: `8000`
- Frontend: `http://localhost:5173`
- CORS: Enabled for localhost

---

## 🎨 UI Components

**Chatbot Location:**
- Bottom-right floating button
- Orange gradient theme
- Available on all pages

**Features:**
- Real-time chat
- Loading indicators
- Message timestamps
- Smooth animations

---

## 🔧 Environment Variables

Required in `/backend/.env`:
```env
COHERE_API_KEY=***
CEREBRAS_API_KEY=***
DB_URL=mongodb+srv://***
PORT=8000
```

---

## ⚠️ Important Notes

1. **Rate Limits:** Cohere free tier has limits - wait if you hit 429
2. **File Formats:** Only `.txt`, `.pdf`, `.md` supported
3. **Ingestion:** Must run `npm run ingest` after adding files
4. **Answers:** Only from uploaded documents, not general knowledge

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Rate limit (429) | Wait 2-3 minutes |
| No documents found | Add files to `uploads/` |
| Import errors | Check new folder structure |
| Chat not responding | Check backend logs for errors |

---

## 📚 Documentation

- Full Guide: `AI_COMPLETE_GUIDE.md`
- Migration Details: `MIGRATION_BEFORE_AFTER.md`
- Summary: `AI_MIGRATION_SUMMARY.md`
- Backend AI: `backend/ai/README.md`
- Frontend AI: `frontend/src/features/ai/README.md`

---

**🚀 You're ready to go! Add documents and start chatting!**

**Need help?** Check the complete guide at `AI_COMPLETE_GUIDE.md`
