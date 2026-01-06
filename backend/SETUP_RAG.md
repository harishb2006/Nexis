# 🚀 Getting Started with RAG System

## Step 1: Get Your Cohere API Key

### Option A: Quick Start (Recommended)

1. Go to [https://cohere.com](https://cohere.com)
2. Click **"Sign Up"** or **"Get Started Free"**
3. Sign up with Google/GitHub (fastest) or email
4. After signup, you'll be redirected to the dashboard
5. Click on **"API Keys"** in the left sidebar
6. Copy your **Production Key** (starts with something like `abc123...`)

### Option B: Navigate Manually

1. Login to [https://dashboard.cohere.com](https://dashboard.cohere.com)
2. Go to **Settings** → **API Keys**
3. Copy your production key

## Step 2: Add to Your .env File

Open `/backend/.env` (or create if it doesn't exist) and add:

```env
COHERE_API_KEY=paste_your_key_here
```

**Full example .env:**
```env
DB_URL=mongodb+srv://...
PORT=8000
JWT_SECRET=randomtoken1234567890
COHERE_API_KEY=your_cohere_key_here
```

## Step 3: Test Ingestion

```bash
cd backend
npm run ingest
```

You should see:
```
✅ Connected to MongoDB
📄 Reading file: ./rag/data/Shipping.txt
🔹 Total chunks: 23
🔄 Creating embeddings with Cohere...
   Processing batch 1/1
✅ Successfully ingested 23 chunks
📊 Embedding dimensions: 1024
```

## Step 4: Test Retrieval

```bash
npm run test-retrieval
```

You should see:
```
🔍 Searching for: "How does shipping work?"
📊 Query embedding created (1024 dimensions)
📚 Comparing against 23 chunks...
✅ Found 3 relevant chunks
```

## 🎉 Success!

If you see the above outputs, your RAG system is working! You've completed Week 1.

## 🔍 What Just Happened?

1. **Ingestion**: Your Shipping.txt was split into chunks and embedded using Cohere
2. **Storage**: All chunks with embeddings are now in MongoDB `knowledge_base` collection
3. **Retrieval**: When you ask a question, it finds the most relevant chunks

## 🧪 Try Different Queries

```bash
# International shipping
node rag/retriever.js "Do you ship to India?"

# Costs
node rag/retriever.js "How much does express shipping cost?"

# Tracking
node rag/retriever.js "Can I track my package?"

# Delays
node rag/retriever.js "What if my delivery is delayed?"
```

## 📊 Check MongoDB

You can view your embeddings in MongoDB Atlas:
1. Go to your cluster
2. Browse Collections → `ai_store` → `knowledge_base`
3. You'll see all your chunks with their embeddings!

## ⚠️ Troubleshooting

### "COHERE_API_KEY is not set"
- Double-check your `.env` file
- Make sure there are no spaces around the `=`
- Restart your terminal after adding

### "Knowledge base is empty"
- Make sure ingestion completed successfully
- Check MongoDB connection string in `.env`

### API Rate Limits
- Free Cohere accounts: 1000 requests/month
- Each ingestion uses ~1 request per 96 chunks
- Each retrieval uses 1 request

## 🎯 Next: Week 2

Once this is working, you'll:
1. Add Cerebras LLM for generating answers
2. Create Express API endpoint (`/api/chat`)
3. Build a chat interface in your frontend
4. Have a fully functional AI customer support bot!

## 💡 Pro Tips

1. **Add more documents**: Put any `.txt` or `.pdf` in `rag/data/`
2. **Re-ingest anytime**: Just run `npm run ingest` again
3. **Adjust chunk size**: Edit `chunkSize` in `rag/ingest.js`
4. **Get more results**: Change `k` parameter (default: 3)

---

Questions? The RAG system is now ready for the next phase! 🚀
