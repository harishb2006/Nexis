import fs from "fs";
import mongoose from "mongoose";
import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
import KnowledgeBase from "../ai/models/knowledgeBase.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config();

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

const MONGO_URI = process.env.DB_URL;

/**
 * Initialize Langchain text splitter
 */
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 50,
  separators: ["\n\n", "\n", " ", ""]
});

/**
 * Load and split document content
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} Array of document chunks
 */
async function loadAndSplitDocument(filePath) {
  // For now, we'll support text files. PDF support can be added later with proper loader
  const content = fs.readFileSync(filePath, "utf-8");
  
  const docs = [{
    pageContent: content,
    metadata: { source: filePath }
  }];
  
  const splitDocs = await textSplitter.splitDocuments(docs);
  
  return splitDocs;
}

/**
 * Ingest a file into the knowledge base
 * @param {string} filePath - Path to the file to ingest
 */
async function ingest(filePath) {
  if (!process.env.COHERE_API_KEY) {
    console.error("❌ COHERE_API_KEY is not set in environment variables");
    console.log("Please add COHERE_API_KEY to your .env file");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log(`📄 Reading and splitting file: ${filePath}`);
    const chunks = await loadAndSplitDocument(filePath);

    console.log(`🔹 Total chunks: ${chunks.length}`);
    console.log(`🔄 Creating embeddings with Cohere...`);

    // Delete existing documents from this source
    const deleteResult = await KnowledgeBase.deleteMany({ source: filePath });
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleteResult.deletedCount} old chunks from this source`);
    }

    // Process chunks in batches for efficiency
    const batchSize = 96; // Cohere allows up to 96 texts per batch
    const documents = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchTexts = batch.map(doc => doc.pageContent);
      
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
      
      // Create embeddings using Cohere
      const embedResponse = await cohere.embed({
        texts: batchTexts,
        model: "embed-english-v3.0",
        inputType: "search_document",
        embeddingTypes: ["float"]
      });

      // Prepare documents for insertion
      batch.forEach((doc, idx) => {
        documents.push({
          content: doc.pageContent,
          embedding: embedResponse.embeddings.float[idx],
          source: filePath,
          chunkIndex: i + idx,
          metadata: {
            totalChunks: chunks.length,
            embeddingModel: "embed-english-v3.0",
            embeddingDimensions: embedResponse.embeddings.float[idx].length,
            ...doc.metadata
          }
        });
      });
    }

    // Bulk insert all documents
    await KnowledgeBase.insertMany(documents);
    
    console.log(`✅ Successfully ingested ${documents.length} chunks`);
    console.log(`📊 Embedding dimensions: ${documents[0].metadata.embeddingDimensions}`);
    console.log(`📁 Source: ${filePath}`);
    
  } catch (error) {
    console.error("❌ Error during ingestion:", error.message);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run ingestion if called directly
if (process.argv[2]) {
  const filePath = process.argv[2];
  ingest(filePath)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  console.log("Usage: node ingest.js <file-path>");
  console.log("Example: node ingest.js ./data/Shipping.txt");
  process.exit(1);
}

export { ingest, loadAndSplitDocument };
