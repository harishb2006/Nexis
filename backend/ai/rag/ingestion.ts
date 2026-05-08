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

import { getCollection } from "../core/pineconeStore.js";

/**
 * Ingest all documents from uploads folder
 */
export async function ingestFromUploads() {
  if (!config.embeddings.apiKey) {
    throw new Error("COHERE_API_KEY is not configured");
  }

  const collection = await getCollection();

  // Get knowledge base documents folder path
  const docsPath = path.join(__dirname, "../data");

  // Scan for documents
  const files = scanUploadsFolder(docsPath);

  if (files.length === 0) {
    return { chunksIngested: 0, files: [] };
  }

  let totalChunks = 0;
  const processedFiles = [];

  // Process each file
  for (const filePath of files) {
    try {
      // Load document
      const docs = await loadDocument(filePath);

      // Split into chunks
      const chunks = await textSplitter.splitDocuments(docs);

      // Note: Delete logic by metadata is skipped with Pinecone. 
      // Fixed IDs per chunk will automatically overwrite older records cleanly.

      // Generate embeddings in batches
      const batchSize = 96;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchTexts = batch.map((doc) => doc.pageContent);

        const batchEmbeddings = await embedDocuments(batchTexts);

        // Prepare for insertion to ChromaDB
        const ids = [];
        const embeddings = [];
        const metadatas = [];
        const documents = [];

        batch.forEach((chunk, idx) => {
          ids.push(`${path.basename(filePath)}_${i + idx}`);
          embeddings.push(batchEmbeddings[idx]);
          metadatas.push({
            source: filePath,
            fileName: path.basename(filePath),
            chunkIndex: i + idx,
            ...chunk.metadata,
          });
          documents.push(chunk.pageContent);
        });

        // Insert into ChromaDB
        await collection.add({
          ids,
          embeddings,
          metadatas,
          documents
        });

        totalChunks += batch.length;
      }

      processedFiles.push({
        file: path.basename(filePath),
        chunks: chunks.length,
      });

    } catch (error) {
      console.error(`Error ingesting file ${filePath}:`, error);
    }
  }

  return {
    chunksIngested: totalChunks,
    files: processedFiles,
  };
}

export default {
  ingestFromUploads,
};
