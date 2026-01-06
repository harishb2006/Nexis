import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mongoose from "mongoose";
import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

const MONGO_URI = process.env.DB_URL;

// Import KnowledgeBase model
import KnowledgeBase from "../models/knowledgeBase.js";

/**
 * Simple text chunker - splits text into overlapping chunks
 */
function chunkText(text, chunkSize = 512, overlap = 50) {
  const chunks = [];
  let start = 0;
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    chunks.push(cleanedText.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
}

/**
 * Read file content (supports PDF and text files)
 */
async function readFile(filePath) {
  if (filePath.endsWith(".pdf")) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return data.text;
  }
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Scan uploads folder and get all document files
 */
function scanUploadsFolder(uploadsPath) {
  const supportedExtensions = ['.txt', '.pdf', '.md'];
  const files = [];

  if (!fs.existsSync(uploadsPath)) {
    console.log(`📁 Creating uploads folder: ${uploadsPath}`);
    fs.mkdirSync(uploadsPath, { recursive: true });
    return files;
  }

  const items = fs.readdirSync(uploadsPath);
  
  items.forEach(item => {
    const fullPath = path.join(uploadsPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (supportedExtensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

/**
 * Ingest all documents from uploads folder
 */
async function ingestFromUploads() {
  if (!process.env.COHERE_API_KEY) {
    console.error("❌ COHERE_API_KEY is not set in environment variables");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get uploads folder path
    const uploadsPath = path.join(__dirname, '../../uploads');
    console.log(`📂 Scanning uploads folder: ${uploadsPath}`);

    // Scan for documents
    const files = scanUploadsFolder(uploadsPath);
    
    if (files.length === 0) {
      console.log("⚠️  No documents found in uploads folder");
      console.log("📝 Supported formats: .txt, .pdf, .md");
      console.log(`📁 Place your documents in: ${uploadsPath}`);
      return;
    }

    console.log(`📚 Found ${files.length} document(s):`);
    files.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${path.basename(file)}`);
    });

    let totalChunks = 0;

    // Process each file
    for (const filePath of files) {
      console.log(`\n📄 Processing: ${path.basename(filePath)}`);
      
      const text = await readFile(filePath);
      const chunks = chunkText(text);
      
      console.log(`   🔹 Chunks: ${chunks.length}`);

      // Delete existing chunks from this source
      const deleteResult = await KnowledgeBase.deleteMany({ source: filePath });
      if (deleteResult.deletedCount > 0) {
        console.log(`   🗑️  Removed ${deleteResult.deletedCount} old chunks`);
      }

      // Process chunks in batches
      const batchSize = 96;
      const documents = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        console.log(`   ⏳ Creating embeddings (batch ${Math.floor(i / batchSize) + 1})...`);
        
        const embedResponse = await cohere.embed({
          texts: batch,
          model: "embed-english-v3.0",
          inputType: "search_document",
          embeddingTypes: ["float"]
        });

        batch.forEach((chunk, idx) => {
          documents.push({
            content: chunk,
            embedding: embedResponse.embeddings.float[idx],
            source: filePath,
            chunkIndex: i + idx,
            metadata: {
              fileName: path.basename(filePath),
              totalChunks: chunks.length,
              embeddingModel: "embed-english-v3.0",
              embeddingDimensions: embedResponse.embeddings.float[idx].length
            }
          });
        });
      }

      await KnowledgeBase.insertMany(documents);
      console.log(`   ✅ Ingested ${documents.length} chunks`);
      totalChunks += documents.length;
    }

    console.log(`\n🎉 Ingestion complete!`);
    console.log(`📊 Total: ${totalChunks} chunks from ${files.length} document(s)`);
    
  } catch (error) {
    console.error("❌ Error during ingestion:", error.message);
    if (error.statusCode === 429) {
      console.error("⚠️  Rate limit exceeded. Please wait a few minutes and try again.");
    }
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🤖 AI Document Ingestion System\n");
  console.log("=".repeat(60));
  
  ingestFromUploads()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { ingestFromUploads, chunkText, readFile, scanUploadsFolder };
