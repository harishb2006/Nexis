import ChatThread from "../models/chatThread.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Memory Service for managing conversation context
 */
export class MemoryService {
  /**
   * Get or create a thread
   */
  static async getOrCreateThread(threadId, userId = null, sessionId = null) {
    try {
      let thread = await ChatThread.findOne({ threadId });

      if (!thread) {
        thread = new ChatThread({
          threadId,
          userId,
          sessionId,
          messages: [],
          metadata: {
            firstMessage: null,
            lastActivity: new Date(),
            messageCount: 0,
            sentiment: "neutral",
          },
        });
        await thread.save();
      }

      return thread;
    } catch (error) {
      console.error("Error getting/creating thread:", error);
      throw error;
    }
  }

  /**
   * Add a message to the thread
   */
  static async addMessage(threadId, role, content, toolsUsed = [], sources = []) {
    try {
      const thread = await ChatThread.findOne({ threadId });

      if (!thread) {
        throw new Error("Thread not found");
      }

      const message = {
        role,
        content,
        timestamp: new Date(),
        toolsUsed,
        sources,
      };

      thread.messages.push(message);

      // Update metadata
      if (!thread.metadata.firstMessage && role === "user") {
        thread.metadata.firstMessage = content;
      }

      await thread.save();

      return thread;
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  /**
   * Get conversation history for LLM
   * Returns array of {role, content} objects
   */
  static async getHistory(threadId, limit = 10) {
    try {
      const thread = await ChatThread.findOne({ threadId });

      if (!thread) {
        return [];
      }

      // Get last N messages
      const recentMessages = thread.messages.slice(-limit);

      // Convert to LLM format
      return recentMessages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }

  /**
   * Get full thread with all metadata
   */
  static async getThread(threadId) {
    try {
      return await ChatThread.findOne({ threadId });
    } catch (error) {
      console.error("Error getting thread:", error);
      throw error;
    }
  }

  /**
   * Get user's recent threads
   */
  static async getUserThreads(userId, limit = 20) {
    try {
      return await ChatThread.find({ userId })
        .sort({ "metadata.lastActivity": -1 })
        .limit(limit)
        .select("threadId metadata createdAt");
    } catch (error) {
      console.error("Error getting user threads:", error);
      return [];
    }
  }

  /**
   * Update sentiment for escalation detection
   */
  static async updateSentiment(threadId, sentiment) {
    try {
      const thread = await ChatThread.findOne({ threadId });

      if (!thread) {
        throw new Error("Thread not found");
      }

      thread.metadata.sentiment = sentiment;
      await thread.save();

      return thread;
    } catch (error) {
      console.error("Error updating sentiment:", error);
      throw error;
    }
  }

  /**
   * Mark thread as escalated
   */
  static async escalateThread(threadId, reason) {
    try {
      const thread = await ChatThread.findOne({ threadId });

      if (!thread) {
        throw new Error("Thread not found");
      }

      thread.metadata.escalated = true;
      thread.metadata.escalationReason = reason;
      await thread.save();

      return thread;
    } catch (error) {
      console.error("Error escalating thread:", error);
      throw error;
    }
  }

  /**
   * Generate a briefing note for human handoff
   */
  static async generateBriefing(threadId) {
    try {
      const thread = await ChatThread.findOne({ threadId });

      if (!thread) {
        throw new Error("Thread not found");
      }

      const messages = thread.messages;
      const userMessages = messages.filter((m) => m.role === "user");
      const toolsUsed = messages
        .filter((m) => m.toolsUsed && m.toolsUsed.length > 0)
        .flatMap((m) => m.toolsUsed);

      // Extract key information
      const briefing = {
        threadId: thread.threadId,
        userId: thread.userId,
        duration: `${Math.floor((Date.now() - thread.createdAt) / 1000 / 60)} minutes`,
        messageCount: thread.metadata.messageCount,
        sentiment: thread.metadata.sentiment,
        firstMessage: thread.metadata.firstMessage,
        recentMessages: userMessages.slice(-3).map((m) => m.content),
        toolsUsed: [...new Set(toolsUsed.map((t) => t.tool))],
        escalationReason: thread.metadata.escalationReason,
        summary: `Customer initiated conversation ${thread.metadata.messageCount} messages ago. Current sentiment: ${thread.metadata.sentiment}. ${
          toolsUsed.length > 0 ? `AI attempted actions: ${toolsUsed.map((t) => t.tool).join(", ")}` : "No automated actions taken."
        }`,
      };

      return briefing;
    } catch (error) {
      console.error("Error generating briefing:", error);
      throw error;
    }
  }

  /**
   * Clean up old threads (optional maintenance)
   */
  static async cleanupOldThreads(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await ChatThread.deleteMany({
        "metadata.lastActivity": { $lt: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up threads:", error);
      throw error;
    }
  }
}

/**
 * Generate a unique thread ID
 */
export function generateThreadId() {
  return uuidv4();
}
