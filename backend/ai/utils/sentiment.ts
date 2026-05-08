/**
 * Sentiment Analysis Utilities
 */
import { NEGATIVE_SENTIMENT_KEYWORDS } from "../config/constants.js";

/**
 * Detect negative sentiment in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sentiment analysis result
 */
export function detectSentiment(text) {
  const lowerText = text.toLowerCase();

  const matchedKeywords = NEGATIVE_SENTIMENT_KEYWORDS.filter((keyword) =>
    lowerText.includes(keyword)
  );

  const severity =
    matchedKeywords.length >= 2
      ? "high"
      : matchedKeywords.length === 1
      ? "medium"
      : "low";

  return {
    isNegative: matchedKeywords.length > 0,
    keywords: matchedKeywords,
    severity,
  };
}

export default {
  detectSentiment,
};
