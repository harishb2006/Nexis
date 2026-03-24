/**
 * Document Ingestion CLI Script
 * Processes documents from uploads folder and populates the knowledge base
 */
import { ingestFromUploads } from "../rag/ingestion.js";
import { validateConfig } from "../config/index.js";
import mongoose from "mongoose";

async function main() {
  console.log("🚀 Starting document ingestion...\n");

  // Validate configuration
  if (!validateConfig()) {
    console.error("❌ Configuration error: Missing required API keys or DB URL");
    process.exit(1);
  }

  try {
    // Run ingestion
    const result = await ingestFromUploads();

    console.log("\n✅ Ingestion Complete!");
    console.log(`📊 Total chunks ingested: ${result.chunksIngested}`);
    console.log(`📁 Files processed: ${result.files.length}\n`);

    if (result.files.length > 0) {
      console.log("Files:");
      result.files.forEach((file) => {
        console.log(`  - ${file.file}: ${file.chunks} chunks`);
      });
    } else {
      console.log("⚠️  No documents found in uploads folder");
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Ingestion failed:", error.message);
    console.error(error);
    
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

main();
