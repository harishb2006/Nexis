<div align="center">
  <h1>🤖 Nexis E-commerce & Autonomous AI Agent</h1>
  <p><strong>A production-grade, full-stack e-commerce platform supercharged by a Level-3 Autonomous AI Agent built with LangGraph.</strong></p>
  <br />

  ![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
  ![React](https://img.shields.io/badge/React-18-blue.svg)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Vector_Search-47A248.svg)
  ![AI System](https://img.shields.io/badge/AI-LangGraph_%7C_Cerebras-purple.svg)
</div>

---

## 🎯 Project Overview

Nexis isn't just another e-commerce clone—it's a demonstration of **modern AI infrastructure integration**. It features a fully functional e-commerce backend and frontend, enhanced by an autonomous agent capable of reasoning, retrieving semantic data, and executing database actions on behalf of the user.

**Unlike standard chatbots**, the Nexis AI Agent decides *which* of its 13 specialized tools to use, executes multi-step workflows (like verifying refund eligibility against store policies), and handles session memory and dynamic streaming directly.

---

## 🔥 Key Technical Achievements

- **Level 3 Agentic Workflow**: Built with LangGraph conditional routing and state-machine architecture.
- **Advanced RAG Pipeline**: Utilizes Cohere embeddings (1024d) and MongoDB Vector Search for fast semantic document retrieval.
- **Multi-Step Reasoning**: AI autonomously queries databases, cross-references RAG knowledge, and applies business logic in a single fluid motion.
- **Server-Sent Events (SSE)**: Provides a real-time, streaming token experience, exposing agent status (🔍 *Searching...* ⚙️ *Executing...*) directly to the React frontend.
- **Production-Ready Security**: Validates all AI tool calls with Zod, ensures JWT-based auth, and implements smart sentiment-based human escalation to prevent AI hallucination loops.

---

## 🏗️ Architecture & Tech Stack

### 🧠 AI Engine (`backend/ai/`)
- **Orchestration**: LangGraph & LangChain Core
- **LLM Engine**: Cerebras (Llama 3.3 70B Fast Inference)
- **Embeddings**: Cohere (embed-english-v3.0)
- **Vector DB**: MongoDB Atlas Vector Search

### ⚙️ Backend API (`backend/`)
- **Framework**: Node.js / Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth & Security**: JWT Authentication & bcrypt

### 💻 Frontend Client (`frontend/`)
- **Framework**: React 18 (Vite build system)
- **State & UI**: Redux Toolkit, TailwindCSS, Lucide React icons

---

## 📋 The 13 Autonomous Tools

The LangGraph agent is equipped with the following toolsets, automatically invoked based on conversational intent:

1. `check_order`: Retrieves exact order status (Auth protected).
2. `get_my_orders`: Lists user transaction history.
3. `search_products`: Semantic product search integration.
4. `check_refund_eligibility`: **Multi-step logic** querying DB and Vector Store.
5. `escalate_to_human`: Sentiment analysis hand-off for angry users.
6. `update_order_status`: Admin dashboard operations.
7. `update_product_stock`: Real-time inventory adjustments.
8. `get_all_orders`: Admin reporting system.
9. `cancel_order`: Cancels an active processing order securely.
10. `return_order`: Initiates a return/refund process directly into the DB.
11. `check_refund_status`: Retrieves specialized refund status tracking info.
12. `update_address`: Allows users to update active shipping addresses securely.
13. `track_order`: Retrieves exact carrier details and tracking numbers.

---

## 🚀 Quick Start (Run Locally)

### 1. Requirements
Ensure you have Node.js 18+, a MongoDB Atlas instance, and API keys for Cohere and Cerebras.

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:
```bash
DB_URL=your_mongodb_connection_string
COHERE_API_KEY=your_cohere_key
CEREBRAS_API_KEY=your_cerebras_key
PORT=8000
```

### 3. Launch the Platform
```bash
# Terminal 1: Install & Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Install & Start Frontend
cd frontend
npm install
npm run dev
```
**Access the app at:** `http://localhost:5173`

---

## 🧪 Testing

The backend includes a test suite verifying the multi-step execution of the LangGraph AI agent:
```bash
cd backend
npm run test-langgraph
```
Validates: RAG Vector Search accuracy, Sentiment escalation triggers, tool execution logic.

---

## 👨‍💻 Author Profile

**Harish B A**
- Email: imharishba@gmail.com
- **Let's connect:** I built this project to demonstrate my capability to design scalable SaaS architectures and build cutting-edge Agentic AI workflows that solve real business problems.
