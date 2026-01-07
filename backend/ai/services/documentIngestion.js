import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { CohereEmbeddings } from "@langchain/cohere";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Langchain Cohere embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-english-v3.0",
  inputType: "search_document"
});

const MONGO_URI = process.env.DB_URL;

// Import KnowledgeBase model
import KnowledgeBase from "../models/knowledgeBase.js";

/**
 * Initialize Langchain text splitter
 */
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 50,
  separators: ["\n\n", "\n", " ", ""]
});

/**
 * Load and read documents (supports PDF and text files)
 */
async function loadDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    // For PDF, we'll use a simple approach with pdf-parse equivalent or manual parsing
    // Since Langchain loaders are having issues, let's use a custom implementation
    const content = fs.readFileSync(filePath, 'utf-8').toString();
    return [{ pageContent: content, metadata: { source: filePath } }];
  } else if (['.txt', '.md'].includes(ext)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return [{ pageContent: content, metadata: { source: filePath } }];
  }
  
  throw new Error(`Unsupported file type: ${ext}`);
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
      
      // Load document using Langchain loader
      const docs = await loadDocument(filePath);
      
      // Split documents into chunks using Langchain text splitter
      const chunks = await textSplitter.splitDocuments(docs);
      
      console.log(`   🔹 Chunks: ${chunks.length}`);

      // Delete existing chunks from this source
      const deleteResult = await KnowledgeBase.deleteMany({ source: filePath });
      if (deleteResult.deletedCount > 0) {
        console.log(`   🗑️  Removed ${deleteResult.deletedCount} old chunks`);
      }

      // Generate embeddings using Langchain Cohere embeddings
      const batchSize = 96;
      const documents = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchTexts = batch.map(doc => doc.pageContent);
        
        console.log(`   ⏳ Creating embeddings (batch ${Math.floor(i / batchSize) + 1})...`);
        
        // Use Langchain embeddings
        const batchEmbeddings = await embeddings.embedDocuments(batchTexts);

        batch.forEach((chunk, idx) => {
          documents.push({
            content: chunk.pageContent,
            embedding: batchEmbeddings[idx],
            source: filePath,
            chunkIndex: i + idx,
            metadata: {
              fileName: path.basename(filePath),
              totalChunks: chunks.length,
              embeddingModel: "embed-english-v3.0",
              embeddingDimensions: batchEmbeddings[idx].length,
              ...chunk.metadata
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

export { ingestFromUploads, loadDocument, scanUploadsFolder, textSplitter };
