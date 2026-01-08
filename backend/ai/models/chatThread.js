import mongoose from "mongoose";

const chatThreadSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    sparse: true, // Allow null for anonymous chats
  },
  sessionId: {
    type: String,
    index: true,
  },
  messages: [
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
  ],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
chatThreadSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.metadata.lastActivity = Date.now();
  this.metadata.messageCount = this.messages.length;
  next();
});

// Index for fast lookups
chatThreadSchema.index({ "metadata.lastActivity": -1 });
chatThreadSchema.index({ userId: 1, "metadata.lastActivity": -1 });

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

export default ChatThread;
