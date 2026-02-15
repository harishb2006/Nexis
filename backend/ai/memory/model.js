/**
 * Chat Thread Model
 * Schema for conversation memory storage
 */
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    toolsUsed: {
      type: Array,
      default: [],
    },
    sources: {
      type: Array,
      default: [],
    },
  },
  { _id: false }
);

const chatThreadSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    messages: [messageSchema],
    metadata: {
      firstMessage: String,
      lastActivity: {
        type: Date,
        default: Date.now,
      },
      messageCount: {
        type: Number,
        default: 0,
      },
      sentiment: {
        type: String,
        enum: ["positive", "neutral", "negative"],
        default: "neutral",
      },
      escalated: {
        type: Boolean,
        default: false,
      },
      escalationReason: String,
    },
  },
  {
    timestamps: true,
  }
);

// Update metadata on save
chatThreadSchema.pre("save", function (next) {
  this.metadata.lastActivity = Date.now();
  this.metadata.messageCount = this.messages.length;
  next();
});

// Indexes for fast lookups
chatThreadSchema.index({ "metadata.lastActivity": -1 });
chatThreadSchema.index({ userId: 1, "metadata.lastActivity": -1 });

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

export default ChatThread;
