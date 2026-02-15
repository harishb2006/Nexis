/**
 * Document Ingestion Service
 * Processes documents and stores embeddings in knowledge base
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedDocuments } from "../core/embeddings.js";
import KnowledgeBase from "../models/knowledgeBase.js";
import config from "../config/index.js";
import { SUPPORTED_DOC_EXTENSIONS } from "../config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Text splitter configuration
 */
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: config.rag.chunkSize,
  chunkOverlap: config.rag.chunkOverlap,
  separators: ["\n\n", "\n", " ", ""],
});

/**
 * Load and read a document file
 * @param {string} filePath - Path to the document
 */
async function loadDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if ([".txt", ".md"].includes(ext)) {
    const content = fs.readFileSync(filePath, "utf-8");
    return [{ pageContent: content, metadata: { source: filePath } }];
  }

  if (ext === ".pdf") {
    // For PDF, read as text (basic support)
    const content = fs.readFileSync(filePath, "utf-8").toString();
    return [{ pageContent: content, metadata: { source: filePath } }];
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

/**
 * Scan uploads folder for document files
 * @param {string} uploadsPath - Path to uploads folder
 */
function scanUploadsFolder(uploadsPath) {
  const files = [];

  if (!fs.existsSync(uploadsPath)) {
    console.log(`📁 Creating uploads folder: ${uploadsPath}`);
    fs.mkdirSync(uploadsPath, { recursive: true });
    return files;
  }

  const items = fs.readdirSync(uploadsPath);

  items.forEach((item) => {
    const fullPath = path.join(uploadsPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (SUPPORTED_DOC_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

/**
 * Ingest all documents from uploads folder
 */
export async function ingestFromUploads() {
  if (!config.embeddings.apiKey) {
    throw new Error("COHERE_API_KEY is not configured");
  }

  // Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.database.url);
    console.log("✅ Connected to MongoDB");
  }

  // Get uploads folder path
  const uploadsPath = path.join(__dirname, "../../uploads");
  console.log(`📂 Scanning uploads folder: ${uploadsPath}`);

  // Scan for documents
  const files = scanUploadsFolder(uploadsPath);

  if (files.length === 0) {
    console.log("⚠️  No documents found in uploads folder");
    console.log(`📝 Supported formats: ${SUPPORTED_DOC_EXTENSIONS.join(", ")}`);
    return { chunksIngested: 0, files: [] };
  }

  console.log(`📚 Found ${files.length} document(s):`);
  files.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${path.basename(file)}`);
  });

  let totalChunks = 0;
  const processedFiles = [];

  // Process each file
  for (const filePath of files) {
    console.log(`\n📄 Processing: ${path.basename(filePath)}`);

    try {
      // Load document
      const docs = await loadDocument(filePath);

      // Split into chunks
      const chunks = await textSplitter.splitDocuments(docs);
      console.log(`   🔹 Chunks: ${chunks.length}`);

      // Delete existing chunks from this source
      const deleteResult = await KnowledgeBase.deleteMany({ source: filePath });
      if (deleteResult.deletedCount > 0) {
        console.log(`   🗑️  Removed ${deleteResult.deletedCount} old chunks`);
      }

      // Generate embeddings in batches
      const batchSize = 96;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchTexts = batch.map((doc) => doc.pageContent);

        console.log(
          `   ⏳ Creating embeddings (batch ${Math.floor(i / batchSize) + 1})...`
        );

        const batchEmbeddings = await embedDocuments(batchTexts);

        // Prepare documents for insertion
        const documents = batch.map((chunk, idx) => ({
          content: chunk.pageContent,
          embedding: batchEmbeddings[idx],
          source: filePath,
          metadata: {
            fileName: path.basename(filePath),
            ...chunk.metadata,
          },
          chunkIndex: i + idx,
        }));

        // Insert into database
        await KnowledgeBase.insertMany(documents);
        totalChunks += documents.length;
      }

      processedFiles.push({
        file: path.basename(filePath),
        chunks: chunks.length,
      });

      console.log(`   ✅ Ingested ${chunks.length} chunks`);
    } catch (error) {
      console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
  }

  console.log(`\n✅ Total chunks ingested: ${totalChunks}`);

  return {
    chunksIngested: totalChunks,
    files: processedFiles,
  };
}

/**
 * Clear all knowledge base entries
 */
export async function clearKnowledgeBase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.database.url);
  }

  const result = await KnowledgeBase.deleteMany({});
  console.log(`🗑️  Cleared ${result.deletedCount} entries from knowledge base`);

  return result.deletedCount;
}

export default {
  ingestFromUploads,
  clearKnowledgeBase,
};
