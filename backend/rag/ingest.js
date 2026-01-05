import fs from "fs";
import pdf from "pdf-parse";
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MONGO_URI = process.env.DB_URL;
const DB_NAME = "ai_store";
const COLLECTION_NAME = "knowledge_base";

/**
 * Simple text chunker - splits text into overlapping chunks
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Size of each chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} Array of text chunks
 */
function chunkText(text, chunkSize = 500, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Read file content (supports PDF and text files)
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} File content as text
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
 * Ingest a file into the knowledge base
 * @param {string} filePath - Path to the file to ingest
 */
async function ingest(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is not set in environment variables");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const collection = client
      .db(DB_NAME)
      .collection(COLLECTION_NAME);

    console.log(`📄 Reading file: ${filePath}`);
    const text = await readFile(filePath);
    const chunks = chunkText(text);

    console.log(`🔹 Total chunks: ${chunks.length}`);
    console.log(`🔄 Creating embeddings and storing...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Create embedding
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk
      });

      // Store in MongoDB
      await collection.insertOne({
        content: chunk,
        embedding: embeddingResponse.data[0].embedding,
        source: filePath,
        createdAt: new Date()
      });

      // Progress indicator
      if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
        console.log(`   Processed ${i + 1}/${chunks.length} chunks`);
      }
    }

    console.log("✅ Ingestion complete");
  } catch (error) {
    console.error("❌ Error during ingestion:", error.message);
    throw error;
  } finally {
    await client.close();
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

export { ingest, chunkText, readFile };
