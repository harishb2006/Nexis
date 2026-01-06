# AI Features - Frontend

This directory contains all AI-powered UI components for the Nexis application.

## Structure

```
ai/
└── components/
    └── Chatbot.jsx  # Floating chatbot widget
```

## Chatbot Component

A beautiful floating chat interface that uses the RAG (Retrieval Augmented Generation) system.

### Features
- 🎨 Modern orange gradient theme
- 💬 Real-time chat interface
- 🤖 AI-powered responses from uploaded documents
- ✨ Smooth animations and transitions
- 📱 Responsive design

### Usage

The chatbot is already integrated into `App.jsx` and appears on all pages:

```jsx
import Chatbot from './features/ai/components/Chatbot';

function App() {
  return (
    <>
      {/* Your routes */}
      <Chatbot />
    </>
  );
}
```

### How It Works

1. User types a question
2. Frontend sends to `/api/v2/chat/ask`
3. Backend retrieves relevant document chunks from uploads folder
4. Cerebras LLM generates answer based on context
5. Response displayed in chat UI

### Customization

Edit the component to:
- Change theme colors (gradient, button styles)
- Modify initial greeting message
- Adjust chat window size
- Add typing indicators
- Implement conversation history persistence
