import express from "express";
import { generateAnswer } from "../rag/chatService.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

const router = express.Router();

/**
 * POST /api/v2/chat/ask
 * Ask a question to the AI chatbot
 * Body: { question: string, history?: Array }
 */
router.post(
  "/ask",
  catchAsyncErrors(async (req, res) => {
    const { question, history = [] } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question",
      });
    }

    console.log(`💬 Chat request: "${question}"`);

    try {
      const result = await generateAnswer(question, history);

      res.status(200).json({
        success: true,
        data: {
          question,
          answer: result.answer,
          sources: result.sources,
          model: result.model,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate response. Please try again.",
        error: error.message,
      });
    }
  })
);

/**
 * GET /api/v2/chat/health
 * Check if chat service is healthy
 */
router.get("/health", (req, res) => {
  const hasCohere = !!process.env.COHERE_API_KEY;
  const hasCerebras = !!process.env.CEREBRAS_API_KEY;

  res.status(200).json({
    success: true,
    message: "Chat service is running",
    status: {
      cohere: hasCohere ? "configured" : "missing",
      cerebras: hasCerebras ? "configured" : "missing",
      ready: hasCohere && hasCerebras,
    },
  });
});

/**
 * POST /api/v2/chat/suggestions
 * Get suggested questions based on knowledge base
 */
router.get("/suggestions", (req, res) => {
  const suggestions = [
    "How does shipping work?",
    "What are your shipping costs?",
    "Do you ship internationally?",
    "How can I track my order?",
    "What if my package is delayed?",
    "Can you ship to PO Boxes?",
    "How long does standard shipping take?",
    "What countries do you ship to?",
  ];

  res.status(200).json({
    success: true,
    suggestions,
  });
});

export default router;
