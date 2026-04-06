/**
 * Database Utilities
 * Shared database connection helper
 */
import mongoose from "mongoose";
import config from "../config/configMain.js";

/**
 * Ensure MongoDB connection is established
 */
export async function ensureConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.database.url);
  }
}

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export default {
  ensureConnection,
  isValidObjectId,
};
