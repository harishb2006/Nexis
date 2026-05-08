import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  threadId: {
    type: String,
    index: true,
  },
  messageIndex: {
    type: Number,
    required: true,
  },
  feedbackType: {
    type: String,
    enum: ['up', 'down'],
    required: true,
  },
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
  category: {
    type: String,
    default: 'general',
  },
  userId: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for analytics queries
feedbackSchema.index({ feedbackType: 1, timestamp: -1 });
feedbackSchema.index({ category: 1, feedbackType: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
