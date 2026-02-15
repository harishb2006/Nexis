/**
 * Chat Controller
 * Non-streaming API endpoint for AI chat
 */
import express from "express";
import { execute } from "../agents/supportAgent.js";
import { ingestFromUploads } from "../rag/ingestion.js";
import { DEFAULT_SUGGESTIONS } from "../config/constants.js";
import { validateConfig } from "../config/index.js";
import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";

const router = express.Router();

/**
 * POST /api/v2/chat/ask
 * Ask a question to the AI chatbot
 */
router.post(
  "/ask",
  catchAsyncErrors(async (req, res) => {
    const { question, history = [], userId = null, email = null } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question",
      });
    }

    console.log(`💬 Chat request: "${question}"`);

    try {
      const result = await execute(question, history, { userId, email });

      res.status(200).json({
        success: true,
        data: {
          question,
          answer: result.answer,
          sources: result.sources,
          toolsUsed: result.toolsUsed,
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
  const isConfigured = validateConfig();

  res.status(200).json({
    success: true,
    message: "Chat service is running",
    status: {
      configured: isConfigured,
      ready: isConfigured,
    },
  });
});

/**
 * GET /api/v2/chat/suggestions
 * Get suggested questions
 */
router.get("/suggestions", (req, res) => {
  res.status(200).json({
    success: true,
    suggestions: DEFAULT_SUGGESTIONS,
  });
});

/**
 * POST /api/v2/chat/ingest
 * Trigger document ingestion from uploads folder
 */
router.post(
  "/ingest",
  catchAsyncErrors(async (req, res) => {
    console.log("📚 Starting document ingestion...");

    const result = await ingestFromUploads();

    res.status(200).json({
      success: true,
      message: "Document ingestion complete",
      data: result,
    });
  })
);

export default router;
