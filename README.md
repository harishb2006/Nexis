# Nexis E-commerce Platform 🛍️

A modern, full-stack e-commerce application with **AI-powered chatbot** built using the MERN stack (MongoDB, Express, React, Node.js) and advanced RAG (Retrieval Augmented Generation) technology.

## ✨ Features

### 🛒 E-commerce Core
- User authentication & authorization
- Product browsing and search
- Shopping cart management
- Order processing
- Address management
- User profile & order history

### 🤖 AI-Powered Chatbot (NEW!)
- **RAG System:** Answers questions from your uploaded documents
- **Smart Retrieval:** Semantic search using Cohere embeddings
- **Context-Aware:** Uses Cerebras LLM for intelligent responses
- **Dynamic Knowledge:** Just drop documents in `uploads/` folder
- **Beautiful UI:** Floating chat widget with modern orange theme

## 🏗️ Architecture

```
Nexis/
├── backend/          # Node.js + Express API
│   ├── ai/          # 🤖 AI Features (RAG System)
│   ├── controller/  # Business logic controllers
│   ├── model/       # MongoDB models
│   ├── middleware/  # Auth, error handling
│   └── uploads/     # 📂 Drop your documents here
│
└── frontend/        # React + Vite + Tailwind
    └── src/
        ├── features/
        │   └── ai/  # 🤖 AI Components (Chatbot UI)
        ├── components/
        ├── pages/
        └── store/   # Redux state management
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cohere API key (for embeddings)
- Cerebras API key (for LLM)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Nexis
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
DB_URL=your_mongodb_connection_string
COHERE_API_KEY=your_cohere_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
PORT=8000
EOF
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Add Documents for AI Chatbot**
```bash
# Drop your .pdf, .txt, or .md files here
cp your-document.pdf backend/uploads/

# Ingest documents
cd backend
npm run ingest
```

5. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Open Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 🤖 AI Chatbot Usage

### Adding Documents
1. Place any `.txt`, `.pdf`, or `.md` file in `/backend/uploads/`
2. Run `npm run ingest` from backend directory
3. Chatbot will now answer questions from those documents!

### API Endpoints
```
POST /api/v2/chat/ask          - Ask a question
POST /api/v2/chat/ingest       - Trigger document ingestion
GET  /api/v2/chat/health       - Health check
GET  /api/v2/chat/suggestions  - Get suggested questions
```

### Example
```bash
curl -X POST http://localhost:8000/api/v2/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'
```

## 📚 Documentation

- [🎯 Quick Reference](QUICK_REFERENCE.md) - Commands and API reference
- [📖 Complete Guide](AI_COMPLETE_GUIDE.md) - Detailed AI system documentation
- [🔄 System Workflow](SYSTEM_WORKFLOW.md) - Architecture and data flow
- [📦 Migration Details](MIGRATION_BEFORE_AFTER.md) - Before/after comparison
- [Backend AI](backend/ai/README.md) - Backend AI features
- [Frontend AI](frontend/src/features/ai/README.md) - Frontend AI components

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js with ES6 modules
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **AI/ML:**
  - Cohere (embed-english-v3.0) - 1024d embeddings
  - Cerebras (llama-3.3-70b) - LLM inference
  - RAG architecture for question answering

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Redux Toolkit
- **Icons:** Lucide React
- **HTTP:** Axios

### AI Infrastructure
- **Embeddings:** Cohere embed-english-v3.0 (1024 dimensions)
- **LLM:** Cerebras llama-3.3-70b
- **Vector Storage:** MongoDB
- **Search:** Cosine similarity
- **Document Processing:** pdf-parse

## 📊 Project Status

### Current Features
✅ User authentication & authorization  
✅ Product CRUD operations  
✅ Shopping cart & checkout  
✅ Order management  
✅ Address management  
✅ AI chatbot with RAG system  
✅ Dynamic document ingestion  
✅ Semantic search  
✅ Modern, responsive UI  

### Currently Ingested
- **Document:** Harish Declaration form.pdf
- **Chunks:** 29
- **Embeddings:** 1024 dimensions
- **Status:** ✅ Ready for queries

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies
- CORS configuration
- Environment variable management
- API key protection

## 📝 Scripts

### Backend
```bash
npm run dev          # Start with nodemon
npm start            # Production start
npm run ingest       # Ingest documents from uploads/
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
```

## 🐛 Troubleshooting

### Cohere Rate Limit (429 Error)
**Problem:** "TooManyRequestsError: Please wait and try again later"  
**Solution:** Wait 2-3 minutes. Free tier has request limits.

### No Documents Found
**Problem:** "⚠️ No documents found in uploads folder"  
**Solution:** Add `.txt`, `.pdf`, or `.md` files to `/backend/uploads/`

### Import Errors
**Problem:** Module not found errors  
**Solution:** Verify new folder structure:
- Backend AI: `ai/services/`, `ai/controllers/`, `ai/models/`
- Frontend AI: `features/ai/components/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

- **Email:** imharishba@gmail.com
- **Project:** Nexis E-commerce Platform

---

**🎉 Now with AI-powered customer support!** Just drop documents in the uploads folder and let your customers ask questions! 🤖
