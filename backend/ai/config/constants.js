/**
 * AI Module Constants
 * Centralized constants for the AI system
 */

/**
 * Sentiment analysis keywords for escalation detection
 */
export const NEGATIVE_SENTIMENT_KEYWORDS = [
  "frustrated",
  "angry",
  "terrible",
  "horrible",
  "awful",
  "worst",
  "disappointed",
  "upset",
  "furious",
  "manager",
  "supervisor",
  "unacceptable",
  "ridiculous",
  "pathetic",
  "useless",
  "waste",
  "complaint",
  "sue",
  "lawyer",
  "refund now",
  "cancel everything",
];

/**
 * Tool display names for UI
 */
export const TOOL_DISPLAY_NAMES = {
  check_order: "Checking Order Status",
  get_my_orders: "Fetching Your Orders",
  search_products: "Searching Products",
  get_all_orders: "Fetching All Orders",
  update_order_status: "Updating Order",
  update_product_stock: "Updating Stock",
  check_refund_eligibility: "Checking Refund Eligibility",
  escalate_to_human: "Escalating to Human Support",
};

/**
 * Order status transitions (state machine)
 */
export const ORDER_STATUS_TRANSITIONS = {
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

/**
 * Supported file extensions for document ingestion
 */
export const SUPPORTED_DOC_EXTENSIONS = [".txt", ".pdf", ".md"];

/**
 * Event types for streaming
 */
export const EVENT_TYPES = {
  THREAD_INIT: "thread_init",
  STATUS: "status",
  SENTIMENT_DETECTED: "sentiment_detected",
  TOOL_START: "tool_start",
  TOOL_COMPLETE: "tool_complete",
  TOOL_ERROR: "tool_error",
  ANSWER_START: "answer_start",
  ANSWER_CHUNK: "answer_chunk",
  COMPLETE: "complete",
  ERROR: "error",
};

/**
 * Default suggested questions
 */
export const DEFAULT_SUGGESTIONS = [
  "How does shipping work?",
  "What are your shipping costs?",
  "Do you ship internationally?",
  "How can I track my order?",
  "What if my package is delayed?",
  "Can you ship to PO Boxes?",
  "How long does standard shipping take?",
  "What countries do you ship to?",
];

export default {
  NEGATIVE_SENTIMENT_KEYWORDS,
  TOOL_DISPLAY_NAMES,
  ORDER_STATUS_TRANSITIONS,
  SUPPORTED_DOC_EXTENSIONS,
  EVENT_TYPES,
  DEFAULT_SUGGESTIONS,
};
