import mongoose from "mongoose";
import dotenv from "dotenv";
import KnowledgeBase from "../ai/models/knowledgeBase.js";

dotenv.config();

async function clearKnowledgeBase() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to MongoDB");

    const result = await KnowledgeBase.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} documents from knowledge base`);

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

clearKnowledgeBase();
