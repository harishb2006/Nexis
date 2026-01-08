#!/bin/bash

# SupportFlow AI - Quick Start Script
# This script helps you get the AI agent running quickly

set -e  # Exit on error

echo "🤖 SupportFlow AI - Quick Start"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating template...${NC}"
    cat > .env << 'EOF'
# Database
DB_URL=mongodb://localhost:27017/ecommerce

# AI APIs  
CEREBRAS_API_KEY=your_cerebras_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# Server
PORT=4000
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ Created .env template${NC}"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys before continuing!"
    echo ""
    read -p "Press enter when you've updated .env with your keys..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if knowledge base is ingested
echo ""
echo -e "${BLUE}📚 Checking knowledge base...${NC}"
read -p "Have you run 'npm run ingest' to load documents? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📥 Ingesting documents...${NC}"
    npm run ingest
    echo -e "${GREEN}✓ Knowledge base loaded${NC}"
else
    echo -e "${GREEN}✓ Knowledge base already loaded${NC}"
fi

# Run tests
echo ""
echo -e "${BLUE}🧪 Running system tests...${NC}"
node testSupportFlow.js

# Ask if user wants to start the server
echo ""
read -p "🚀 Start the server now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}✓ Starting SupportFlow AI...${NC}"
    echo ""
    echo "📝 Server will run on http://localhost:4000"
    echo "📝 Frontend should be on http://localhost:5173"
    echo ""
    echo "Try these test messages in the chatbot:"
    echo "  • 'How does shipping work?'"
    echo "  • 'Show me all pending orders'"
    echo "  • 'Show me electronics products'"
    echo ""
    npm run dev
else
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "To start the server later, run:"
    echo "  npm run dev"
    echo ""
    echo "To start frontend (in another terminal):"
    echo "  cd ../frontend && npm run dev"
fi
