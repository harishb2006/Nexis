# 📘 Nexis E-commerce Application - Complete Guide

> **A Simple but Complete Guide to Understanding Every Part of This Application**

---

## 🎯 What Is This Application?

Nexis is a **full-stack e-commerce platform** with an **AI-powered chatbot**. Think of it like Amazon, but with a smart AI assistant that can:
- Answer questions about shipping, returns, and policies
- Check your orders
- Search for products
- Understand when you're frustrated and escalate to human support

---

## 🏗️ Overall Architecture (The Big Picture)

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Web Browser)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  - React Components (UI)                                     │
│  - Redux Store (State Management)                            │
│  - Axios (API Calls)                                         │
│  - React Router (Page Navigation)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API + SSE
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Express.js Server                         │       │
│  │  - Routes (user, product, orders, chat)           │       │
│  │  - Controllers (business logic)                   │       │
│  │  - Middleware (auth, error handling)              │       │
│  └────────────────┬─────────────────────────────────┘       │
│                   │                                          │
│  ┌────────────────▼──────────────────────────────┐          │
│  │        AI Agent (LangGraph)                    │          │
│  │  - Sentiment Analysis                          │          │
│  │  - RAG (Knowledge Base Search)                 │          │
│  │  - LLM Decision Making                         │          │
│  │  - Tool Execution (8 specialized tools)        │          │
│  │  - Streaming Responses                         │          │
│  └────────────────────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ MongoDB Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB)                         │
│  - Users Collection                                          │
│  - Products Collection                                       │
│  - Orders Collection                                         │
│  - KnowledgeBase Collection (AI data)                        │
│  - ChatThreads Collection (AI conversations)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Folder Structure Explained

### **Backend Structure**
```
backend/
├── server.js              # Entry point - starts the server
├── app.js                 # Express app configuration
├── package.json           # Dependencies and scripts
│
├── ai/                    # 🤖 AI Agent System (The Brain)
│   ├── agents/
│   │   └── supportAgent.js    # LangGraph agent - state machine logic
│   ├── config/
│   │   ├── constants.js       # Configuration values
│   │   ├── prompts.js         # AI prompts/instructions
│   │   └── index.js           # Environment variables
│   ├── core/
│   │   ├── llm.js             # Cerebras AI connection
│   │   ├── embeddings.js      # Cohere embeddings
│   │   └── toolConverter.js   # Convert tools to LLM format
│   ├── memory/
│   │   ├── service.js         # Conversation memory management
│   │   └── model.js           # ChatThread database model
│   ├── models/
│   │   └── knowledgeBase.js   # Knowledge base schema
│   ├── rag/
│   │   ├── ingestion.js       # Load documents into vector DB
│   │   └── retriever.js       # Search knowledge base
│   ├── routes/
│   │   ├── chat.js            # Regular chat endpoint
│   │   └── streaming.js       # Streaming chat (Server-Sent Events)
│   ├── tools/
│   │   ├── orders.js          # Order management tools
│   │   ├── products.js        # Product search tools
│   │   └── support.js         # Support tools (escalation, etc.)
│   └── utils/
│       ├── sentiment.js       # Detect user frustration
│       └── database.js        # Database helpers
│
├── controller/            # 🎮 Business Logic Controllers
│   ├── user.js            # User registration, login, profile
│   ├── product.js         # Create, update, get products
│   ├── orders.js          # Order creation, status updates
│   └── chat.js            # Chat-related operations
│
├── middleware/            # 🛡️ Request Processing
│   ├── auth.js            # JWT authentication
│   ├── error.js           # Error handling
│   └── catchAsyncErrors.js # Async error wrapper
│
├── model/                 # 📊 Database Schemas
│   ├── user.js            # User schema (name, email, password, cart)
│   ├── product.js         # Product schema (name, price, stock, images)
│   ├── order.js           # Order schema (items, status, shipping)
│   ├── ticket.js          # Support ticket schema
│   └── feedback.js        # Feedback schema
│
├── db/
│   └── Database.js        # MongoDB connection
│
├── uploads/               # 📁 Knowledge Base Documents
│   ├── Shipping.txt       # Shipping policy
│   ├── Returns.txt        # Return policy
│   ├── Payment.txt        # Payment info
│   └── Eligibility.txt    # Eligibility criteria
│
└── utils/                 # 🔧 Utility Functions
    ├── ErrorHandler.js    # Custom error class
    ├── jwtToken.js        # JWT creation/validation
    └── sendMail.js        # Email functionality
```

### **Frontend Structure**
```
frontend/
├── index.html             # HTML entry point
├── vite.config.js         # Vite bundler config
├── package.json           # Dependencies
│
├── src/
│   ├── main.jsx           # React entry point (renders App)
│   ├── App.jsx            # Main app component with routing
│   ├── Routes.jsx         # Route exports
│   ├── axiosConfig.js     # API base URL configuration
│   │
│   ├── components/        # 🧩 Reusable Components
│   │   └── auth/
│   │       ├── Login.jsx      # Login form
│   │       ├── Signup.jsx     # Registration form
│   │       ├── nav.jsx        # Navigation bar
│   │       ├── Product.jsx    # Product card component
│   │       └── CartProduct.jsx # Cart item component
│   │
│   ├── features/          # ✨ Feature Modules
│   │   └── ai/
│   │       └── components/
│   │           └── ChatbotStreaming.jsx  # AI chatbot UI
│   │
│   ├── pages/             # 📄 Full Page Components
│   │   ├── Home.jsx           # Homepage with products
│   │   ├── Login.jsx          # Login page
│   │   ├── Signup.jsx         # Registration page
│   │   ├── cart.jsx           # Shopping cart
│   │   ├── productDetails.jsx # Single product view
│   │   ├── myorders.jsx       # User's order history
│   │   ├── profile.jsx        # User profile
│   │   ├── createProduct.jsx  # Create/edit product
│   │   ├── myProducts.jsx     # Seller's products
│   │   ├── SelectAddress.jsx  # Choose shipping address
│   │   ├── OrderConfirmation.jsx # Review order
│   │   ├── OrderSuccess.jsx   # Order placed confirmation
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   └── FeedbackDashboard.jsx # Feedback management
│   │
│   └── store/             # 🗄️ Redux State Management
│       ├── store.js       # Redux store configuration
│       └── userActions.js # User-related actions
```

---

## 🔄 How Data Flows Through The App

### **1. User Registration Flow**
```
User fills form → Frontend sends POST /api/v2/user/create-user
                    ↓
              Backend validates data
                    ↓
              Hashes password (bcrypt)
                    ↓
              Saves to MongoDB (User collection)
                    ↓
              Returns success response
                    ↓
          Frontend redirects to login
```

**Files Involved:**
- Frontend: `src/components/auth/Signup.jsx`
- Backend: `controller/user.js` (create-user route)
- Model: `model/user.js`

### **2. User Login Flow**
```
User enters credentials → POST /api/v2/user/login
                           ↓
                   Backend finds user by email
                           ↓
                   Compares password (bcrypt)
                           ↓
                   Creates JWT token
                           ↓
                   Sets HTTP-only cookie
                           ↓
                   Returns user data
                           ↓
              Frontend stores in Redux
                           ↓
              Redirects to homepage
```

**Files Involved:**
- Frontend: `src/components/auth/Login.jsx`
- Backend: `controller/user.js` (login route)
- Middleware: `middleware/auth.js`

### **3. Creating a Product Flow**
```
Seller uploads images + data → POST /api/v2/product/create-product
                                ↓
                    Auth middleware checks JWT token
                                ↓
                    Multer saves images to /products folder
                                ↓
                    Validates product data
                                ↓
                    Saves to MongoDB (Product collection)
                                ↓
                    Returns product ID
                                ↓
              Frontend shows success message
```

**Files Involved:**
- Frontend: `src/pages/createProduct.jsx`
- Backend: `controller/product.js`
- Model: `model/product.js`
- Multer: `multer.js`

### **4. Placing an Order Flow**
```
User adds to cart → Cart stored in Redux + MongoDB user.cart
                    ↓
Select shipping address
                    ↓
Review order → POST /api/v2/orders/create-order
                    ↓
Backend verifies user authentication
                    ↓
Creates Order document with:
  - orderItems (products, quantities)
  - shippingAddress
  - totalAmount
  - orderStatus: "Processing"
                    ↓
Clears user's cart
                    ↓
Returns order ID
                    ↓
Frontend redirects to success page
```

**Files Involved:**
- Frontend: `src/pages/cart.jsx`, `src/pages/SelectAddress.jsx`, `src/pages/OrderConfirmation.jsx`
- Backend: `controller/orders.js`
- Model: `model/order.js`

### **5. AI Chatbot Flow (The Most Complex Part)**

```
User types question in chatbot → POST /api/v2/chat/stream
                                   ↓
                    Backend creates/retrieves threadId (conversation memory)
                                   ↓
                    Gets conversation history from MongoDB
                                   ↓
                    Starts Server-Sent Events (SSE) stream
                                   ↓
        ┌──────────────────────────────────────────────────┐
        │         LANGGRAPH AGENT EXECUTES                 │
        │  (State Machine with Multiple Nodes)             │
        ├──────────────────────────────────────────────────┤
        │                                                  │
        │  NODE 1: Sentiment Analysis                      │
        │    - Detect if user is frustrated/angry          │
        │    - Keywords: "terrible", "worst", "upset"      │
        │    - If negative → prepare for escalation        │
        │                                                  │
        │  NODE 2: RAG Retrieval                           │
        │    - Convert question to vector (Cohere)         │
        │    - Search KnowledgeBase collection             │
        │    - Find top 3 most relevant chunks             │
        │    - Format as context                           │
        │                                                  │
        │  NODE 3: LLM Decision                            │
        │    - Send question + context to Cerebras AI      │
        │    - AI decides: use tools or answer directly    │
        │    - If tools needed → extract tool calls        │
        │                                                  │
        │  NODE 4: Tool Execution (if needed)              │
        │    - Run tools like:                             │
        │      * check_order(orderId)                      │
        │      * search_products(category)                 │
        │      * check_refund_eligibility(orderId)         │
        │    - Get results from database                   │
        │                                                  │
        │  NODE 5: Final Answer                            │
        │    - Combine tool results + context              │
        │    - Generate friendly response                  │
        │    - Stream word-by-word to user                 │
        │                                                  │
        └──────────────────────────────────────────────────┘
                                   ↓
            Save conversation to MongoDB (ChatThread)
                                   ↓
           Frontend displays streaming response
```

**Files Involved:**
- Frontend: `src/features/ai/components/ChatbotStreaming.jsx`
- Backend Routes: `ai/routes/streaming.js`
- Agent: `ai/agents/supportAgent.js`
- Tools: `ai/tools/orders.js`, `ai/tools/products.js`, `ai/tools/support.js`
- RAG: `ai/rag/retriever.js`
- LLM: `ai/core/llm.js`
- Memory: `ai/memory/service.js`

---

## 📊 Database Models Explained

### **User Model** (`model/user.js`)
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password_here",  // Encrypted with bcrypt
  phoneNumber: 1234567890,
  addresses: [
    {
      country: "USA",
      city: "New York",
      address1: "123 Main St",
      zipCode: 10001,
      addressType: "Home"
    }
  ],
  role: "user",  // or "admin"
  avatar: {
    public_id: "avatar123",
    url: "/uploads/avatar.jpg"
  },
  cart: [
    {
      productId: "6789abc...",  // References Product
      quantity: 2
    }
  ]
}
```

### **Product Model** (`model/product.js`)
```javascript
{
  name: "iPhone 15",
  description: "Latest Apple smartphone",
  category: "Electronics",
  tags: ["smartphone", "apple"],
  price: 999,
  stock: 50,
  email: "seller@example.com",  // Who created this product
  images: ["/products/image1.jpg", "/products/image2.jpg"],
  createdAt: "2026-02-16T..."
}
```

### **Order Model** (`model/order.js`)
```javascript
{
  user: "user_id_here",  // References User
  orderItems: [
    {
      product: "product_id_here",  // References Product
      name: "iPhone 15",
      quantity: 1,
      price: 999,
      image: ["/products/image1.jpg"]
    }
  ],
  shippingAddress: {
    country: "USA",
    city: "New York",
    address1: "123 Main St",
    zipCode: 10001
  },
  totalAmount: 999,
  orderStatus: "Processing",  // or "Shipped", "Delivered", "Cancelled"
  deliveredAt: null,  // Date when delivered
  createdAt: "2026-02-16T..."
}
```

### **KnowledgeBase Model** (`ai/models/knowledgeBase.js`)
```javascript
{
  content: "Shipping takes 3-5 business days...",  // Text chunk
  embedding: [0.123, 0.456, ...],  // 1024-dim vector from Cohere
  source: "Shipping.txt",
  metadata: {
    category: "shipping",
    lastUpdated: "2026-02-16"
  }
}
```

### **ChatThread Model** (`ai/memory/model.js`)
```javascript
{
  threadId: "thread_abc123",
  userId: "user_id_here",  // Optional
  messages: [
    {
      role: "user",
      content: "Where is my order?",
      timestamp: "2026-02-16T10:00:00Z"
    },
    {
      role: "assistant",
      content: "Let me check that for you...",
      toolsUsed: ["check_order"],
      sources: [...],
      timestamp: "2026-02-16T10:00:05Z"
    }
  ],
  createdAt: "2026-02-16T..."
}
```

---

## 🤖 AI Agent Deep Dive

### **What is LangGraph?**
LangGraph is a framework for building **stateful, multi-step AI agents**. Think of it as a **flowchart** where:
- Each box is a "node" (a function that does something)
- Arrows between boxes are "edges" (how data flows)
- The agent can loop, make decisions, and use tools

### **The Support Agent State Machine**

```
                    START
                      ↓
        ┌─────────────────────────┐
        │   1. SENTIMENT NODE     │  ← Detect if user is angry
        │   (Synchronous)         │
        └──────────┬──────────────┘
                   ↓
        ┌─────────────────────────┐
        │   2. RAG NODE           │  ← Search knowledge base
        │   (Vector Search)       │
        └──────────┬──────────────┘
                   ↓
        ┌─────────────────────────┐
        │   3. DECISION NODE      │  ← LLM decides what to do
        │   (Cerebras AI)         │
        └──────────┬──────────────┘
                   ↓
            Tools needed?
         ┌──────┴──────┐
       YES              NO
         ↓               ↓
    ┌────────────┐   ┌──────────────┐
    │ 4. TOOL    │   │ 5. ANSWER    │
    │    NODE    │   │    NODE      │
    └─────┬──────┘   └──────┬───────┘
          │                 │
          └────────┬────────┘
                   ↓
                  END
```

### **The 8 AI Tools Explained**

#### **1. check_order** (Basic)
- **Purpose:** Get order status for a specific order
- **Input:** `orderId`, `userId` (optional)
- **Process:**
  1. Validate orderId format
  2. Query Order collection in MongoDB
  3. Check user owns the order (if userId provided)
  4. Return order details (status, amount, shipping address)
- **Example:** User asks "Where is order #123456?"

#### **2. get_my_orders** (Basic)
- **Purpose:** List all orders for logged-in user
- **Input:** `userId` or `email`, `status` (optional), `limit`
- **Process:**
  1. Find user by email or userId
  2. Query all orders for that user
  3. Filter by status if specified
  4. Sort by creation date (newest first)
  5. Return order list with summary
- **Example:** User asks "Show my orders"

#### **3. search_products** (Basic)
- **Purpose:** Find products by category or search term
- **Input:** `category`, `limit`
- **Process:**
  1. Query Product collection by category
  2. Return matching products with details
- **Example:** User asks "Show me electronics"

#### **4. check_refund_eligibility** (Advanced - Multi-Step)
- **Purpose:** Determine if order qualifies for refund
- **Input:** `orderId`, `userId`
- **Process:**
  1. **Step 1:** Fetch order from database
  2. **Step 2:** Check order status (only "Delivered" eligible)
  3. **Step 3:** Calculate days since delivery
  4. **Step 4:** Search RAG for refund policy
  5. **Step 5:** Apply business rules from policy
  6. **Step 6:** Return eligibility decision
- **Example:** User asks "Can I return my order?"
- **Why Advanced:** Combines DB + RAG + logic in one tool

#### **5. escalate_to_human** (Advanced)
- **Purpose:** Transfer frustrated user to human support
- **Input:** `reason`, `userId`, `email`
- **Process:**
  1. Create support ticket in database
  2. Generate briefing for human agent (context summary)
  3. Return ticket ID and confirmation
- **Example:** User says "I want to speak to a manager"
- **Why Advanced:** Creates structured handoff with context

#### **6. update_order_status** (Admin Tool)
- **Purpose:** Change order status (admin only)
- **Input:** `orderId`, `newStatus`
- **Process:**
  1. Validate status transition (can't go from "Delivered" to "Processing")
  2. Update Order document
  3. Set deliveredAt if status = "Delivered"
- **Example:** Admin marks order as shipped

#### **7. update_product_stock** (Admin Tool)
- **Purpose:** Modify product inventory
- **Input:** `productId`, `newStock`
- **Process:**
  1. Find product by ID
  2. Update stock value
  3. Return confirmation
- **Example:** Admin adds 50 more units

#### **8. get_all_orders** (Admin Tool)
- **Purpose:** View all orders across all users
- **Input:** `status` (optional), `limit`
- **Process:**
  1. Query all orders
  2. Filter by status if specified
  3. Return comprehensive list
- **Example:** Admin checks all pending orders

### **How Tool Execution Works**

```javascript
// 1. LLM returns tool call
{
  "tool": "check_order",
  "input": {
    "orderId": "66d4e9f7e3b2c5a4f8d12345",
    "userId": "user_abc123"
  }
}

// 2. Backend executes tool
const result = await checkOrder({
  orderId: "66d4e9f7e3b2c5a4f8d12345",
  userId: "user_abc123"
});

// 3. Tool queries database
const order = await Order.findById(orderId).populate("user");

// 4. Tool returns structured result
{
  "success": true,
  "orderId": "66d4e9f7e3b2c5a4f8d12345",
  "status": "Shipped",
  "totalAmount": "$999",
  "customerEmail": "john@example.com",
  "createdAt": "Feb 10, 2026"
}

// 5. LLM generates natural language response
"Your order #12345 is currently shipped! It should arrive soon."
```

---

## 🧠 RAG System Explained

**RAG = Retrieval-Augmented Generation**

Instead of the AI making up answers, it **searches a knowledge base** for real information.

### **Step-by-Step RAG Process**

#### **1. Ingestion** (One-Time Setup)
File: `ai/rag/ingestion.js`

```
Text Files (Shipping.txt, Returns.txt)
            ↓
   Split into chunks (500 chars each)
            ↓
   Create embeddings with Cohere
   (Each chunk → 1024-dimensional vector)
            ↓
   Save to MongoDB KnowledgeBase collection
```

Example chunk:
```javascript
{
  content: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 days.",
  embedding: [0.023, -0.456, 0.789, ...],  // 1024 numbers
  source: "Shipping.txt"
}
```

#### **2. Retrieval** (Every Query)
File: `ai/rag/retriever.js`

```
User question: "How long does shipping take?"
            ↓
   1. Convert To Vector
      embedQuery("How long does shipping take?")
      → [0.034, -0.412, 0.823, ...]
            ↓
   2. Compare with All Chunks
      Calculate cosine similarity:
      similarity = dot(query_vector, chunk_vector)
            ↓
   3. Rank by Similarity
      Chunk A: 0.87 (87% match) ← Best match
      Chunk B: 0.72 (72% match)
      Chunk C: 0.45 (45% match)
            ↓
   4. Return Top 3 Chunks
      [Chunk A, Chunk B, Chunk C]
```

#### **3. Generation** (LLM)
```
System Prompt: "You are a helpful assistant. Use this context:"

Context:
[Context 1]: Standard shipping takes 3-5 business days...
[Context 2]: Express shipping costs $15 extra...

User: "How long does shipping take?"

AI Response: "Standard shipping takes 3-5 business days. 
If you need it faster, we offer express shipping for 1-2 days!"
```

**Files Involved:**
- `ai/rag/ingestion.js` - Load documents
- `ai/rag/retriever.js` - Search knowledge base
- `ai/core/embeddings.js` - Create vectors with Cohere
- `ai/models/knowledgeBase.js` - Database schema

---

## 🔐 Authentication System

### **How JWT Works**

```
1. User Logs In
   Email: john@example.com
   Password: secret123
            ↓
2. Backend Verifies
   - Find user by email
   - Compare password hash
            ↓
3. Create JWT Token
   Payload: { id: "user123", email: "john@example.com" }
   Secret: "randomtoken1234567890"
   Expiry: 7 days
   
   Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIx..."
            ↓
4. Send as Cookie
   Set-Cookie: token=eyJhbGc...; HttpOnly; Secure
            ↓
5. Frontend Stores User in Redux
   store.user = { email, role, name }
```

### **Protected Routes**

Every request to protected endpoints:
```
Request → Middleware checks cookie
            ↓
   Does token exist?
      YES          NO
       ↓            ↓
   Valid?      Return 401
      YES   NO
       ↓     ↓
   Attach  401
   req.user
       ↓
   Continue
```

**Files:**
- `controller/user.js` - Login/register endpoints
- `middleware/auth.js` - `isAuthenticatedUser` middleware
- `utils/jwtToken.js` - Token utilities

---

## 🎨 Frontend State Management

### **Redux Store Structure**

File: `src/store/store.js`

```javascript
{
  user: {
    email: "john@example.com",
    role: "user",
    name: "John Doe",
    isAuthenticated: true
  }
}
```

### **How Components Access State**

```javascript
// In any component
import { useSelector, useDispatch } from 'react-redux';

function MyComponent() {
  // Read state
  const userEmail = useSelector((state) => state.user.email);
  const isAdmin = useSelector((state) => state.user.role === "admin");
  
  // Update state
  const dispatch = useDispatch();
  dispatch(setUser({ email, role, name }));
}
```

**Key Actions:**
- `setUser(userData)` - Save user after login
- `clearUser()` - Logout user

---

## 🔄 API Endpoints Reference

### **User Routes** (`/api/v2/user`)
```
POST   /create-user     - Register new user
POST   /login           - Login user (returns JWT cookie)
GET    /getuser         - Get current user (requires auth)
GET    /logout          - Logout user
POST   /update-user-info - Update profile (requires auth)
POST   /update-avatar   - Update profile picture
PUT    /update-user-addresses - Add/edit addresses
DELETE /delete-user-address/:id - Remove address
```

### **Product Routes** (`/api/v2/product`)
```
POST   /create-product  - Create product (requires auth)
GET    /get-products    - Get all products
GET    /my-products     - Get user's products (requires auth)
GET    /get-product/:id - Get single product details
PUT    /update-product/:id - Update product (requires auth)
DELETE /delete-product/:id - Delete product (requires auth)
```

### **Order Routes** (`/api/v2/orders`)
```
POST   /create-order    - Place new order (requires auth)
GET    /get-user-orders - Get user's orders (requires auth)
GET    /get-order/:id   - Get single order (requires auth)
PUT    /update-order-status/:id - Update status (admin only)
GET    /admin/get-all-orders - Get all orders (admin only)
```

### **Chat Routes** (`/api/v2/chat`)
```
POST   /stream          - AI chatbot (Server-Sent Events)
POST   /message         - Regular chat (non-streaming)
```

---

## 🚀 How to Run The Application

### **Prerequisites**
- Node.js (v18+)
- MongoDB (local or Atlas)
- API Keys:
  - Cerebras AI API key
  - Cohere API key

### **Backend Setup**

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Variables**
Create `backend/config/.env`:
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/nexis
JWT_SECRET=randomtoken1234567890
NODE_ENV=development

# AI Keys
CEREBRAS_API_KEY=your_cerebras_key
COHERE_API_KEY=your_cohere_key
```

3. **Load Knowledge Base**
```bash
npm run ingest
```
This reads `uploads/*.txt` files and creates embeddings.

4. **Start Server**
```bash
npm run dev  # Development (auto-restart)
npm start    # Production
```

Server runs on: `http://localhost:8000`

### **Frontend Setup**

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Variables**
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

3. **Start Dev Server**
```bash
npm run dev
```

App runs on: `http://localhost:5173`

### **Create Admin User**
```bash
cd backend
node createAdmin.js
```
This creates an admin account you can login with.

---

## 🧪 Testing The Application

### **Test AI Agent**
```bash
cd backend
npm run test-langgraph
```
This runs test cases for the LangGraph agent.

### **Manual Testing Checklist**

#### **E-commerce Functions**
- [ ] Register new user
- [ ] Login as user
- [ ] Upload product with images
- [ ] Browse products on homepage
- [ ] Add product to cart
- [ ] Place order with shipping address
- [ ] View order history
- [ ] Login as admin
- [ ] Update order status (admin)

#### **AI Chatbot Functions**
- [ ] Ask about shipping policy
- [ ] Ask about return policy
- [ ] Search for products ("Show me electronics")
- [ ] Check order status ("Where is my order #123?")
- [ ] Test sentiment ("This is terrible, I want a refund!")
- [ ] View conversation memory (ask follow-up questions)
- [ ] Test streaming response
- [ ] Test tool usage indicators

---

## 🔍 Common Issues & Solutions

### **Issue 1: MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### **Issue 2: AI Chatbot Not Responding**
**Check:**
1. CEREBRAS_API_KEY is set correctly
2. COHERE_API_KEY is set correctly
3. Knowledge base is loaded (`npm run ingest`)
4. Check backend logs for errors

### **Issue 3: Images Not Showing**
**Solution:** Make sure folders exist:
```bash
cd backend
mkdir -p uploads products
```

### **Issue 4: CORS Errors**
```
Access to fetch has been blocked by CORS policy
```
**Solution:** Check `backend/app.js` allows your frontend URL:
```javascript
const allowedOrigins = [
  'http://localhost:5173',  // Your frontend URL
];
```

### **Issue 5: JWT Authentication Fails**
**Solution:** Check cookie settings in `backend/controller/user.js`:
```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: false,  // Set to false for localhost
  sameSite: "Lax",
});
```

---

## 📚 Key Technologies Used

### **Backend**
- **Express.js** - Web server framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **LangChain** - AI framework
- **LangGraph** - Agent state machine
- **Cerebras AI** - Large language model
- **Cohere** - Text embeddings

### **Frontend**
- **React** - UI library
- **Redux** - State management
- **React Router** - Page navigation
- **Axios** - HTTP requests
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Markdown** - Render AI responses

---

## 🎓 Learning Path

### **If You're New to Backend:**
1. Start with `backend/server.js` - Entry point
2. Read `backend/app.js` - Understand Express setup
3. Look at `model/user.js` - Database schemas
4. Study `controller/user.js` - Business logic
5. Check `middleware/auth.js` - Authentication

### **If You're New to Frontend:**
1. Start with `frontend/src/main.jsx` - Entry point
2. Read `frontend/src/App.jsx` - Routing
3. Look at `pages/Home.jsx` - Page structure
4. Study `components/auth/Login.jsx` - Forms
5. Check `store/store.js` - State management

### **If You're New to AI:**
1. Start with `ai/routes/streaming.js` - API endpoint
2. Read `ai/agents/supportAgent.js` - State machine
3. Look at `ai/tools/orders.js` - Tool definition
4. Study `ai/rag/retriever.js` - Vector search
5. Check `ai/core/llm.js` - LLM calls

---

## 🎯 Key Concepts Explained Simply

### **What is a REST API?**
It's how the frontend talks to the backend.
```
Frontend: "Hey backend, give me products"
Backend: "Here's the product list: [...]"
```

### **What is JWT?**
A secure way to prove you're logged in without sending passwords every time.
```
Login once → Get token → Send token with every request
```

### **What is Server-Sent Events (SSE)?**
A way for the server to send updates to the client continuously.
```
Client: "Start streaming"
Server: "Here's word 1... word 2... word 3..."
Client: (displays each word as it arrives)
```

### **What is Vector Search?**
Converting text to numbers to find similar content.
```
"How does shipping work?" → [0.1, 0.5, 0.3, ...]
Compare with all documents
Find most similar → Return relevant info
```

### **What is State Machine?**
A flowchart that the AI follows to make decisions.
```
Start → Analyze sentiment → Search knowledge → Decide tools → Execute → Answer
```

---

## 📖 File-by-File Code Explanation

### **Backend Core Files**

#### **server.js** (Server Entry Point)
```javascript
// 1. Import the Express app
import app from "./app.js";

// 2. Connect to MongoDB
import connectDatabase from "./db/Database.js";
connectDatabase();

// 3. Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// 4. Handle errors gracefully
process.on("unhandledRejection", (err) => {
  server.close(() => process.exit(1));
});
```

**What it does:** Starts everything. Connects to database, starts server, handles crashes.

---

#### **app.js** (Express Configuration)
```javascript
// 1. Create Express app
const app = express();

// 2. Enable CORS (allow frontend to connect)
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true,  // Allow cookies
}));

// 3. Parse JSON requests
app.use(express.json());

// 4. Parse cookies
app.use(cookieParser());

// 5. Serve static files (images)
app.use('/uploads', express.static('uploads'));
app.use('/products', express.static('products'));

// 6. Register routes
app.use("/api/v2/user", userRoutes);
app.use("/api/v2/product", productRoutes);
app.use("/api/v2/orders", orderRoutes);
app.use("/api/v2/chat", chatRoutes);

// 7. Error handling middleware
app.use(ErrorHandler);
```

**What it does:** Configures Express to handle requests, parse data, serve files, and route to correct controllers.

---

#### **db/Database.js** (MongoDB Connection)
```javascript
import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed");
    process.exit(1);
  }
};

export default connectDatabase;
```

**What it does:** Connects to MongoDB. If connection fails, exits the app.

---

### **Model Files** (Database Schemas)

#### **model/user.js**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },  // Hidden by default
  phoneNumber: { type: Number },
  addresses: [
    {
      country: String,
      city: String,
      address1: String,
      zipCode: Number,
      addressType: String
    }
  ],
  role: { type: String, default: "user" },  // "user" or "admin"
  avatar: {
    public_id: String,
    url: String
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

export default mongoose.model("User", userSchema);
```

**What it does:** Defines user structure. Auto-hashes passwords. Provides login methods.

---

#### **model/product.js**
```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },  // "Electronics", "Clothing", etc.
  tags: { type: [String], default: [] },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  email: { type: String, required: true },  // Seller's email
  images: { type: [String], required: true },  // Array of image URLs
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
```

**What it does:** Defines product structure. Stores images as URLs.

---

#### **model/order.js**
```javascript
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number,
      image: Array
    }
  ],
  shippingAddress: {
    country: String,
    city: String,
    address1: String,
    address2: String,
    zipCode: Number,
    addressType: String
  },
  totalAmount: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  deliveredAt: Date
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
```

**What it does:** Defines order structure. Tracks status changes over time.

---

### **Controller Files** (Business Logic)

#### **controller/user.js** (User Operations)

**Register User:**
```javascript
router.post("/create-user", upload.single("file"), async (req, res) => {
  const { name, email, password } = req.body;
  
  // 1. Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  
  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 3. Save avatar file
  let fileUrl = "";
  if (req.file) {
    fileUrl = path.join("uploads", req.file.filename);
  }
  
  // 4. Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: { public_id: req.file?.filename || "", url: fileUrl }
  });
  
  res.status(201).json({ success: true, user });
});
```

**What it does:** Checks if email is unique, hashes password, saves avatar, creates user in database.

**Login User:**
```javascript
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Find user (include password field)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  // 2. Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  // 3. Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  // 4. Set cookie
  res.cookie("token", token, {
    httpOnly: true,  // Can't access from JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  });
  
  // 5. Return user data (remove password from response)
  user.password = undefined;
  res.json({ success: true, token, user });
});
```

**What it does:** Finds user, checks password, creates JWT token, sets secure cookie.

---

#### **controller/product.js** (Product Operations)

**Create Product:**
```javascript
router.post("/create-product", isAuthenticatedUser, 
  pupload.array("images", 10), async (req, res) => {
  
  const { name, description, category, tags, price, stock, email } = req.body;
  
  // 1. Process uploaded images
  const images = req.files.map(file => `/products/${path.basename(file.path)}`);
  
  // 2. Validate data
  if (!name || !description || !category || !price || !stock || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  if (images.length === 0) {
    return res.status(400).json({ error: "At least one image required" });
  }
  
  // 3. Verify seller exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  
  // 4. Create product
  const newProduct = await Product.create({
    name, description, category, tags,
    price, stock, email, images
  });
  
  res.status(201).json({
    message: "Product created successfully",
    product: newProduct
  });
});
```

**What it does:** Saves images to disk, validates input, creates product in database.

**Get Products:**
```javascript
router.get("/get-products", async (req, res) => {
  const products = await Product.find();
  res.json({ products });
});

router.get("/get-product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json({ product });
});
```

**What it does:** Fetches all products or single product by ID.

---

#### **controller/orders.js** (Order Operations)

**Create Order:**
```javascript
router.post("/create-order", isAuthenticatedUser, async (req, res) => {
  const { orderItems, shippingAddress, totalAmount } = req.body;
  
  // 1. Validate input
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  
  // 2. Create order
  const order = await Order.create({
    user: req.user._id,  // From auth middleware
    orderItems,
    shippingAddress,
    totalAmount,
    orderStatus: "Processing"
  });
  
  // 3. Clear user's cart
  await User.findByIdAndUpdate(req.user._id, { cart: [] });
  
  // 4. Reduce product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }
  
  res.status(201).json({
    success: true,
    order,
    message: "Order placed successfully"
  });
});
```

**What it does:** Creates order, clears cart, updates product stock.

**Get User Orders:**
```javascript
router.get("/get-user-orders", isAuthenticatedUser, async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product")
    .sort({ createdAt: -1 });  // Newest first
  
  res.json({ success: true, orders });
});
```

**What it does:** Fetches all orders for logged-in user.

---

### **Middleware Files**

#### **middleware/auth.js** (Authentication)
```javascript
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // 1. Get token from cookie
  const token = req.cookies.token;
  
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  
  // 2. Verify token
  let decodedData;
  try {
    decodedData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
  
  // 3. Find user
  req.user = await User.findById(decodedData.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  // 4. Continue to next middleware/route
  next();
});

export const isAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Please login first", 401));
  }
  
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Access denied. Admin privileges required.", 403));
  }
  
  next();
});
```

**What it does:** Checks JWT token, attaches user to request object, verifies admin role.

---

### **AI Module Files**

#### **ai/core/llm.js** (LLM Connection)
```javascript
import { CerebrasClient } from "@cerebras/cerebras_cloud_sdk";

const client = new CerebrasClient({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Regular completion (no tools)
export async function complete(messages) {
  const response = await client.chat.completions.create({
    model: "ministral-3b-2407",  // Fast, efficient model
    messages: messages,
    temperature: 0.7,
    max_tokens: 500
  });
  return response;
}

// Completion with tool calling
export async function completeWithTools(messages, tools) {
  const response = await client.chat.completions.create({
    model: "ministral-3b-2407",
    messages: messages,
    tools: tools,  // AI can choose to use these tools
    tool_choice: "auto",  // AI decides if tools needed
    temperature: 0.7,
    max_tokens: 500
  });
  return response;
}

// Streaming completion (word-by-word)
export async function streamCompletion(messages) {
  const stream = await client.chat.completions.stream({
    model: "ministral-3b-2407",
    messages: messages,
    temperature: 0.7,
    max_tokens: 500,
    stream: true
  });
  
  return stream;
}
```

**What it does:** Connects to Cerebras AI API. Sends prompts, gets responses. Supports streaming.

---

#### **ai/core/embeddings.js** (Vector Embeddings)
```javascript
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Convert text to 1024-dimensional vector
export async function embedQuery(text) {
  const response = await cohere.embed({
    texts: [text],
    model: "embed-english-v3.0",
    inputType: "search_query"
  });
  
  return response.embeddings[0];  // Array of 1024 numbers
}

// Convert multiple texts to vectors
export async function embedDocuments(texts) {
  const response = await cohere.embed({
    texts: texts,
    model: "embed-english-v3.0",
    inputType: "search_document"
  });
  
  return response.embeddings;
}

// Calculate similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

**What it does:** Converts text to numbers (embeddings). Calculates similarity between texts.

---

#### **ai/rag/ingestion.js** (Load Knowledge Base)
```javascript
import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { embedDocuments } from '../core/embeddings.js';
import KnowledgeBase from '../models/knowledgeBase.js';
import mongoose from 'mongoose';

async function ingestDocuments() {
  // 1. Connect to database
  await mongoose.connect(process.env.MONGO_URI);
  
  // 2. Clear existing documents
  await KnowledgeBase.deleteMany({});
  
  // 3. Read all .txt files from uploads/
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadsDir)
    .filter(file => file.endsWith('.txt'));
  
  // 4. Process each file
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 5. Split into chunks (500 chars, 50 overlap)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50
    });
    const chunks = await splitter.splitText(content);
    
    // 6. Create embeddings for all chunks
    const embeddings = await embedDocuments(chunks);
    
    // 7. Save to database
    for (let i = 0; i < chunks.length; i++) {
      await KnowledgeBase.create({
        content: chunks[i],
        embedding: embeddings[i],
        source: file,
        metadata: { category: file.replace('.txt', '') }
      });
    }
    
    console.log(`✅ Ingested ${file}: ${chunks.length} chunks`);
  }
  
  console.log('✅ All documents ingested successfully');
  process.exit(0);
}

ingestDocuments();
```

**What it does:** Reads .txt files, splits into chunks, creates embeddings, saves to MongoDB.

---

#### **ai/rag/retriever.js** (Search Knowledge Base)
```javascript
import { embedQuery, cosineSimilarity } from '../core/embeddings.js';
import KnowledgeBase from '../models/knowledgeBase.js';

export async function retrieveRelevantChunks(query, k = 3) {
  // 1. Convert query to vector
  const queryVector = await embedQuery(query);
  
  // 2. Get all documents from database
  const allDocs = await KnowledgeBase.find({}).lean();
  
  if (allDocs.length === 0) return [];
  
  // 3. Calculate similarity scores
  const results = allDocs.map(doc => ({
    content: doc.content,
    source: doc.source,
    score: cosineSimilarity(queryVector, doc.embedding),
    metadata: doc.metadata
  }));
  
  // 4. Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  // 5. Return top k results
  return results.slice(0, k);
}

export function formatChunksAsContext(chunks) {
  if (chunks.length === 0) return "";
  
  return chunks
    .map((chunk, idx) => `[Context ${idx + 1}]:\n${chunk.content}`)
    .join("\n\n");
}

export function formatChunksAsSources(chunks) {
  return chunks.map(chunk => ({
    content: chunk.content.substring(0, 150) + "...",
    relevance: (chunk.score * 100).toFixed(1) + "%"
  }));
}
```

**What it does:** Converts query to vector, compares with all documents, returns most similar.

---

#### **ai/tools/orders.js** (Order Tools)

**Check Order Tool:**
```javascript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Order from "../../model/order.js";

export const checkOrder = tool(
  async ({ orderId, userId = null }) => {
    // 1. Validate ObjectId format
    if (!isValidObjectId(orderId)) {
      return JSON.stringify({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    // 2. Find order
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .lean();
    
    if (!order) {
      return JSON.stringify({
        success: false,
        message: `Order not found`
      });
    }
    
    // 3. Check ownership
    if (userId && order.user._id.toString() !== userId) {
      return JSON.stringify({
        success: false,
        message: "Access denied. You can only view your own orders."
      });
    }
    
    // 4. Return order details
    return JSON.stringify({
      success: true,
      orderId: order._id,
      status: order.orderStatus,
      totalAmount: `$${order.totalAmount}`,
      itemCount: order.orderItems.length,
      customerEmail: order.user?.email,
      shippingCity: order.shippingAddress.city,
      createdAt: new Date(order.createdAt).toLocaleDateString(),
      deliveredAt: order.deliveredAt 
        ? new Date(order.deliveredAt).toLocaleDateString() 
        : "Not delivered yet"
    });
  },
  {
    name: "check_order",
    description: "Check order status and details. Use when customer asks about their order.",
    schema: z.object({
      orderId: z.string().describe("The order ID"),
      userId: z.string().optional()
        .describe("The authenticated user ID for ownership verification")
    })
  }
);
```

**What it does:** Defines a tool that LLM can call to check order status. Uses Zod for validation.

---

#### **ai/agents/supportAgent.js** (LangGraph State Machine)

**State Definition:**
```javascript
import { Annotation } from "@langchain/langgraph";

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
    default: () => ({ isNegative: false, keywords: [], severity: "low" }) 
  }),
  toolCalls: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  toolResults: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  
  // Output
  finalAnswer: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  eventStream: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  
  // Control
  shouldContinue: Annotation({ reducer: (x, y) => y ?? x, default: () => true }),
  iterationCount: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 })
});
```

**What it does:** Defines all data the agent tracks as it processes a request.

**Sentiment Node:**
```javascript
async function sentimentNode(state) {
  const sentiment = detectSentiment(state.userQuestion);
  const events = [...state.eventStream];
  
  if (sentiment.isNegative) {
    events.push({
      type: EVENT_TYPES.SENTIMENT_DETECTED,
      message: `⚠️ Detected concern: ${sentiment.keywords.join(", ")}`,
      severity: sentiment.severity,
      status: "monitoring"
    });
  }
  
  return { sentiment, eventStream: events };
}
```

**What it does:** Analyzes user's message for frustration. Adds event to stream if negative.

**RAG Node:**
```javascript
async function ragNode(state) {
  const events = [...state.eventStream];
  events.push({
    type: EVENT_TYPES.STATUS,
    message: "🔍 Searching knowledge base...",
    status: "searching"
  });
  
  try {
    // Search for relevant chunks
    const chunks = await retrieveRelevantChunks(state.userQuestion, 3);
    const context = formatChunksAsContext(chunks);
    const sources = formatChunksAsSources(chunks);
    
    events.push({
      type: EVENT_TYPES.STATUS,
      message: `📚 Found ${chunks.length} relevant documents`,
      status: "found"
    });
    
    return { context, sources, eventStream: events };
  } catch (error) {
    events.push({
      type: EVENT_TYPES.STATUS,
      message: "⚠️ Knowledge base unavailable",
      status: "warning"
    });
    return { context: "", sources: [], eventStream: events };
  }
}
```

**What it does:** Searches knowledge base, formats results, adds status events.

**Decision Node:**
```javascript
async function decisionNode(state) {
  const events = [...state.eventStream];
  events.push({
    type: EVENT_TYPES.STATUS,
    message: "🤖 AI analyzing request...",
    status: "thinking"
  });
  
  // Build prompt with context from RAG
  const systemPrompt = supportAgentPrompt(state.context, state.threadId);
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...state.messages,
    { role: "user", content: state.userQuestion }
  ];
  
  // Call LLM with tools
  const tools = getToolsForLLM();
  const completion = await completeWithTools(messages, tools);
  const assistantMessage = completion.choices[0].message;
  
  // Check if AI wants to use tools
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    events.push({
      type: EVENT_TYPES.STATUS,
      message: `🛠️ Using ${assistantMessage.tool_calls.length} tool(s)...`,
      status: "executing"
    });
    
    return {
      toolCalls: assistantMessage.tool_calls,
      eventStream: events,
      shouldContinue: true  // Go to tool execution node
    };
  } else {
    // AI generated direct answer, no tools needed
    return {
      finalAnswer: assistantMessage.content,
      eventStream: events,
      shouldContinue: false  // Skip to answer node
    };
  }
}
```

**What it does:** Asks LLM what to do. LLM either answers directly or requests tools.

**Tool Execution Node:**
```javascript
async function toolExecutionNode(state) {
  const events = [...state.eventStream];
  const toolResults = [];
  
  // Execute each tool call
  for (const toolCall of state.toolCalls) {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);
    
    // Inject user info into tool args
    if (state.userId) toolArgs.userId = state.userId;
    if (state.email) toolArgs.email = state.email;
    
    events.push({
      type: EVENT_TYPES.TOOL_EXECUTION,
      message: `⚙️ Running ${getToolDisplayName(toolName)}...`,
      toolName: toolName,
      status: "running"
    });
    
    try {
      // Execute the tool
      const result = await executeTool(toolName, toolArgs);
      
      toolResults.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: toolName,
        content: result
      });
      
      events.push({
        type: EVENT_TYPES.TOOL_RESULT,
        message: `✅ ${getToolDisplayName(toolName)} completed`,
        toolName: toolName,
        result: result.substring(0, 100) + "...",
        status: "completed"
      });
    } catch (error) {
      events.push({
        type: EVENT_TYPES.ERROR,
        message: `❌ Tool failed: ${error.message}`,
        status: "error"
      });
    }
  }
  
  return { toolResults, eventStream: events };
}
```

**What it does:** Runs each tool the LLM requested. Collects results. Adds status events.

**Final Answer Node:**
```javascript
async function finalAnswerNode(state) {
  const events = [...state.eventStream];
  
  // If we already have an answer from decision node, use it
  if (state.finalAnswer) {
    return { finalAnswer: state.finalAnswer, eventStream: events };
  }
  
  // Build messages with tool results
  const messages = [
    { role: "system", content: toolResultPrompt() },
    ...state.messages,
    { role: "user", content: state.userQuestion },
    ...state.toolResults  // Add tool results
  ];
  
  events.push({
    type: EVENT_TYPES.STATUS,
    message: "✏️ Generating response...",
    status: "generating"
  });
  
  // Stream the response word-by-word
  const stream = await streamCompletion(messages);
  let fullAnswer = "";
  
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) {
      fullAnswer += delta;
      
      events.push({
        type: EVENT_TYPES.STREAM_TOKEN,
        content: delta,
        status: "streaming"
      });
    }
  }
  
  events.push({
    type: EVENT_TYPES.COMPLETE,
    answer: fullAnswer,
    toolsUsed: state.toolCalls.map(tc => tc.function.name),
    sources: state.sources,
    status: "complete"
  });
  
  return { finalAnswer: fullAnswer, eventStream: events };
}
```

**What it does:** Generates final response. Streams word-by-word. Includes tool results.

**Graph Construction:**
```javascript
const workflow = new StateGraph(AgentState)
  .addNode("sentiment", sentimentNode)
  .addNode("rag", ragNode)
  .addNode("decision", decisionNode)
  .addNode("tool_execution", toolExecutionNode)
  .addNode("final_answer", finalAnswerNode)
  
  // Define edges (flow)
  .addEdge(START, "sentiment")
  .addEdge("sentiment", "rag")
  .addEdge("rag", "decision")
  
  // Conditional edge: tools or direct answer?
  .addConditionalEdges("decision", (state) => {
    return state.shouldContinue ? "tool_execution" : "final_answer";
  }, {
    tool_execution: "tool_execution",
    final_answer: "final_answer"
  })
  
  .addEdge("tool_execution", "final_answer")
  .addEdge("final_answer", END);

const app = workflow.compile();
```

**What it does:** Connects all nodes into a flowchart. Defines execution order.

---

#### **ai/routes/streaming.js** (SSE Endpoint)
```javascript
router.post("/stream", async (req, res) => {
  const { question, threadId, userId, email } = req.body;
  
  // 1. Validate input
  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid question"
    });
  }
  
  // 2. Get or create conversation thread
  const actualThreadId = threadId || generateThreadId();
  await MemoryService.getOrCreateThread(actualThreadId, userId);
  
  // 3. Get conversation history
  const history = await MemoryService.getHistory(actualThreadId);
  
  // 4. Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  
  try {
    // 5. Send threadId first
    res.write(`data: ${JSON.stringify({ 
      type: "thread_init", 
      threadId: actualThreadId 
    })}\n\n`);
    res.flush();
    
    // 6. Save user message
    await MemoryService.addMessage(actualThreadId, "user", question);
    
    // 7. Run agent and stream events
    const stream = streamExecution(question, history, {
      threadId: actualThreadId,
      userId,
      email
    });
    
    let finalAnswer = "";
    let finalToolsUsed = [];
    let finalSources = [];
    
    // 8. Forward each event to client
    for await (const event of stream) {
      if (event.type === "complete") {
        finalAnswer = event.answer;
        finalToolsUsed = event.toolsUsed || [];
        finalSources = event.sources || [];
      }
      
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      res.flush();
    }
    
    // 9. Save assistant response
    if (finalAnswer) {
      await MemoryService.addMessage(
        actualThreadId,
        "assistant",
        finalAnswer,
        finalToolsUsed,
        finalSources
      );
    }
    
    // 10. End stream
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({
      type: "error",
      message: error.message
    })}\n\n`);
    res.end();
  }
});
```

**What it does:** Sets up Server-Sent Events. Runs agent. Streams each event to client in real-time.

---

### **Frontend Files**

#### **src/main.jsx** (React Entry Point)
```javascript
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './store/store';

// Render app into <div id="root">
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

**What it does:** Wraps app in Redux Provider. Renders to DOM.

---

#### **src/App.jsx** (Main App Component)
```javascript
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userActions';
import axios from './axiosConfig';

const App = () => {
  const dispatch = useDispatch();
  
  // On app load, restore user session
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get('/api/v2/user/getuser', { 
          withCredentials: true 
        });
        
        if (response.data.success) {
          dispatch(setUser({
            email: response.data.user.email,
            role: response.data.user.role,
            name: response.data.user.name
          }));
        }
      } catch (error) {
        // User not logged in, ignore
      }
    };
    loadUser();
  }, [dispatch]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/product/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        {/* ... more routes */}
      </Routes>
      
      {/* Chatbot available on all pages */}
      <ChatbotStreaming />
    </BrowserRouter>
  );
};

export default App;
```

**What it does:** Sets up routing. Restores user session on load. Renders chatbot globally.

---

#### **src/store/store.js** (Redux Store)
```javascript
import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: null,
    role: null,
    name: null,
    isAuthenticated: false
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.email = null;
      state.role = null;
      state.name = null;
      state.isAuthenticated = false;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
});

export default store;
```

**What it does:** Creates Redux store. Manages user state globally.

---

#### **src/features/ai/components/ChatbotStreaming.jsx** (Chatbot UI)

**Main Structure:**
```javascript
function ChatbotStreaming() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [threadId, setThreadId] = useState(null);
  
  const userEmail = useSelector((state) => state.user.email);
  
  // Handle send message
  const handleSendMessage = async (text) => {
    // Add user message to UI
    setMessages(prev => [...prev, {
      type: 'user',
      text: text,
      timestamp: new Date()
    }]);
    
    setIsLoading(true);
    setCurrentAnswer('');
    
    // Open SSE connection
    const response = await fetch('/api/v2/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: text,
        threadId: threadId,
        email: userEmail
      })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    // Read stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      
      // Process each event
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const event = JSON.parse(data);
            
            switch (event.type) {
              case 'thread_init':
                setThreadId(event.threadId);
                break;
              
              case 'status':
                setAgentStatus(event.message);
                break;
              
              case 'stream_token':
                setCurrentAnswer(prev => prev + event.content);
                break;
              
              case 'complete':
                setMessages(prev => [...prev, {
                  type: 'bot',
                  text: event.answer,
                  toolsUsed: event.toolsUsed,
                  sources: event.sources,
                  timestamp: new Date()
                }]);
                setCurrentAnswer('');
                setIsLoading(false);
                break;
            }
          } catch (err) {
            console.error('Error parsing event:', err);
          }
        }
      }
    }
  };
  
  return (
    <div className="chatbot-container">
      {/* Floating button */}
      <button onClick={() => setIsOpen(!isOpen)}>
        <MessageCircle />
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          {/* Messages */}
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.type}>
                {msg.text}
              </div>
            ))}
            
            {/* Show current streaming answer */}
            {currentAnswer && (
              <div className="bot streaming">
                {currentAnswer}
              </div>
            )}
            
            {/* Show agent status */}
            {agentStatus && (
              <div className="status">
                {agentStatus}
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage(input);
              }}
              placeholder="Ask me anything..."
            />
            <button onClick={() => handleSendMessage(input)}>
              <Send />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**What it does:** Displays chat interface. Handles SSE connection. Shows streaming responses in real-time.

---

## 🎓 Summary

### **The Complete Flow:**

1. **User visits website** → Frontend loads
2. **User registers/logs in** → Backend creates JWT, stores user
3. **User browses products** → Frontend fetches from backend API
4. **User adds to cart** → Stored in Redux + MongoDB
5. **User places order** → Backend creates order, updates stock
6. **User opens chatbot** → Frontend connects to SSE endpoint
7. **User asks question** → Backend runs LangGraph agent:
   - Analyzes sentiment
   - Searches knowledge base
   - LLM decides actions
   - Executes tools (database queries)
   - Streams response word-by-word
8. **User sees response** → Displayed in chat interface

### **Key Technologies:**
- **Express.js**: Web server
- **MongoDB**: Database
- **JWT**: Authentication
- **LangGraph**: AI agent state machine
- **Cerebras AI**: Large language model
- **Cohere**: Text embeddings
- **Server-Sent Events**: Real-time streaming
- **React**: Frontend UI
- **Redux**: State management

### **Most Complex Parts:**
1. **LangGraph Agent** - Multi-step AI reasoning with state machine
2. **RAG System** - Vector search in knowledge base
3. **Tool Execution** - LLM calling functions to query database
4. **Streaming Chat** - Server-Sent Events with real-time updates
5. **Conversation Memory** - Persistent chat history across sessions

---

## 🎯 Final Notes

This guide covers **every major file and concept** in the application. You now understand:

✅ How frontend and backend communicate
✅ How authentication works (JWT + cookies)
✅ How products and orders are managed
✅ How the AI agent makes decisions
✅ How RAG retrieves relevant information
✅ How tools execute database operations
✅ How streaming responses work in real-time
✅ How conversation memory persists

**To dive deeper into any section, read the actual code files mentioned. Each file has comments explaining the logic.**

---

## 📞 Need Help?

- **Understand routes:** Check `backend/app.js` for all endpoints
- **Understand database:** Check `backend/model/*.js` for schemas
- **Understand AI:** Check `backend/ai/agents/supportAgent.js` for agent logic
- **Understand frontend:** Check `frontend/src/App.jsx` for routing
- **Understand state:** Check `frontend/src/store/store.js` for Redux

---

**This guide was created to help you understand every part of the Nexis E-commerce Application. Happy coding! 🚀**
