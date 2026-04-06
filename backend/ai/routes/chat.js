/**
 * Chat Controller
 * Non-streaming API endpoint for AI chat
 */
import express from "express";
import { execute } from "../agents/supportAgent.js";
import { ingestFromUploads } from "../rag/ingestion.js";
import { DEFAULT_SUGGESTIONS } from "../config/constants.js";
import { validateConfig } from "../config/configMain.js";
import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";
import Feedback from "../../model/feedback.js";

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
      console.error("❌ Chat error:", error);
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

    const result = await ingestFromUploads();

    res.status(200).json({
      success: true,
      message: "Document ingestion complete",
      data: result,
    });
  })
);

/**
 * POST /api/v2/chat/feedback
 * Store user feedback for a chat message
 */
router.post(
  "/feedback",
  catchAsyncErrors(async (req, res) => {
    const { messageIndex, feedbackType, threadId, question, answer, userId, userEmail } = req.body;

    if (!feedbackType || !['up', 'down'].includes(feedbackType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback type. Must be 'up' or 'down'",
      });
    }

    // Auto-categorize based on keywords
    const category = categorizeFeedback(question || answer || '');

    // Store in database
    const feedback = await Feedback.create({
      messageIndex,
      feedbackType,
      threadId: threadId || null,
      question: question || null,
      answer: answer || null,
      category,
      userId: userId || null,
      userEmail: userEmail || null,
    });

    res.status(200).json({
      success: true,
      message: "Feedback recorded successfully",
      data: {
        id: feedback._id,
        messageIndex,
        feedbackType,
        category,
        threadId,
      },
    });
  })
);

/**
 * GET /api/v2/chat/feedback/analytics
 * Get feedback analytics and statistics
 */
router.get(
  "/feedback/analytics",
  catchAsyncErrors(async (req, res) => {
    const { startDate, endDate, category } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = {};
    if (Object.keys(dateFilter).length > 0) filter.timestamp = dateFilter;
    if (category && category !== 'all') filter.category = category;

    // Get total counts
    const [totalFeedback, positiveCount, negativeCount] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.countDocuments({ ...filter, feedbackType: 'up' }),
      Feedback.countDocuments({ ...filter, feedbackType: 'down' }),
    ]);

    // Get feedback by category
    const byCategory = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { category: '$category', feedbackType: '$feedbackType' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          positive: {
            $sum: { $cond: [{ $eq: ['$_id.feedbackType', 'up'] }, '$count', 0] },
          },
          negative: {
            $sum: { $cond: [{ $eq: ['$_id.feedbackType', 'down'] }, '$count', 0] },
          },
        },
      },
      {
        $project: {
          category: '$_id',
          positive: 1,
          negative: 1,
          total: { $add: ['$positive', '$negative'] },
          satisfactionRate: {
            $multiply: [
              { $divide: ['$positive', { $add: ['$positive', '$negative'] }] },
              100,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Get recent negative feedback for review
    const recentNegative = await Feedback.find({
      ...filter,
      feedbackType: 'down',
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('question answer category timestamp threadId');

    // Daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await Feedback.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            feedbackType: '$feedbackType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          positive: {
            $sum: { $cond: [{ $eq: ['$_id.feedbackType', 'up'] }, '$count', 0] },
          },
          negative: {
            $sum: { $cond: [{ $eq: ['$_id.feedbackType', 'down'] }, '$count', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const satisfactionRate = totalFeedback > 0
      ? ((positiveCount / totalFeedback) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalFeedback,
          positive: positiveCount,
          negative: negativeCount,
          satisfactionRate: parseFloat(satisfactionRate),
        },
        byCategory,
        recentNegative,
        dailyTrend,
      },
    });
  })
);

/**
 * GET /api/v2/chat/feedback/list
 * Get paginated feedback list
 */
router.get(
  "/feedback/list",
  catchAsyncErrors(async (req, res) => {
    const { page = 1, limit = 20, feedbackType, category } = req.query;

    const filter = {};
    if (feedbackType && feedbackType !== 'all') filter.feedbackType = feedbackType;
    if (category && category !== 'all') filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [feedbackList, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('feedbackType question answer category timestamp threadId userEmail'),
      Feedback.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        feedback: feedbackList,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  })
);

// Helper function to categorize feedback
function categorizeFeedback(text) {
  const lowerText = (text || '').toLowerCase();

  if (lowerText.match(/ship|deliver|track|freight|postal/)) return 'shipping';
  if (lowerText.match(/return|refund|exchange|money back/)) return 'returns';
  if (lowerText.match(/order|purchase|buy|cart|checkout/)) return 'orders';
  if (lowerText.match(/payment|pay|credit|card|invoice/)) return 'payment';
  if (lowerText.match(/product|item|quality|description/)) return 'products';
  if (lowerText.match(/account|login|password|profile/)) return 'account';
  if (lowerText.match(/price|cost|discount|coupon|promo/)) return 'pricing';
  if (lowerText.match(/support|help|contact|service/)) return 'support';

  return 'general';
}

export default router;
