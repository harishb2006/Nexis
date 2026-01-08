import express from "express";
import { generateAnswerStream } from "../services/chatServiceStreaming.js";
import { MemoryService, generateThreadId } from "../services/memoryService.js";
import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";

const router = express.Router();

/**
 * POST /api/v2/chat/stream
 * Streaming chat endpoint with Server-Sent Events
 * Shows real-time status updates as the AI works
 */
router.post(
  "/stream",
  catchAsyncErrors(async (req, res) => {
    const { question, threadId, userId = null, sessionId = null } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question",
      });
    }

    // Get or create thread for memory
    const actualThreadId = threadId || generateThreadId();
    const thread = await MemoryService.getOrCreateThread(actualThreadId, userId, sessionId);

    // Get conversation history
    const conversationHistory = await MemoryService.getHistory(actualThreadId);

    console.log(`💬 Streaming chat: "${question}" [Thread: ${actualThreadId}${userId ? `, User: ${userId}` : ''}]`);

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    try {
      // Send threadId to client immediately
      res.write(`data: ${JSON.stringify({ 
        type: 'thread_init', 
        threadId: actualThreadId 
      })}\n\n`);
      if (res.flush) res.flush();

      // Save user message
      await MemoryService.addMessage(actualThreadId, "user", question);

      // Generate response stream with userId for tool authentication
      const stream = generateAnswerStream(question, conversationHistory, actualThreadId, userId);

      let finalAnswer = '';
      let finalToolsUsed = [];
      let finalSources = [];

      // Send each event to client
      for await (const event of stream) {
        // Capture final data for storage
        if (event.type === 'complete') {
          finalAnswer = event.answer;
          finalToolsUsed = event.toolsUsed || [];
          finalSources = event.sources || [];
        }

        // Format as SSE: data: {json}\n\n
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        
        // Flush immediately (important for real-time updates)
        if (res.flush) res.flush();
      }

      // Save assistant response to memory
      if (finalAnswer) {
        await MemoryService.addMessage(
          actualThreadId, 
          "assistant", 
          finalAnswer,
          finalToolsUsed,
          finalSources
        );
      }

      // End the stream
      res.write('data: [DONE]\n\n');
      res.end();

    } catch (error) {
      console.error("❌ Error in streaming endpoint:", error);
      
      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: error.message,
        status: 'error'
      })}\n\n`);
      
      res.end();
    }
  })
);

/**
 * GET /api/v2/chat/thread/:threadId
 * Get conversation history
 */
router.get(
  "/thread/:threadId",
  catchAsyncErrors(async (req, res) => {
    const { threadId } = req.params;

    const thread = await MemoryService.getThread(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        threadId: thread.threadId,
        messages: thread.messages,
        metadata: thread.metadata,
      },
    });
  })
);

/**
 * GET /api/v2/chat/briefing/:threadId
 * Get briefing note for human handoff
 */
router.get(
  "/briefing/:threadId",
  catchAsyncErrors(async (req, res) => {
    const { threadId } = req.params;

    const briefing = await MemoryService.generateBriefing(threadId);

    res.status(200).json({
      success: true,
      data: briefing,
    });
  })
);

export default router;
