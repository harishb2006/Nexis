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

let client = null;

/**
 * Get MongoDB client (creates new one if doesn't exist)
 * @returns {Promise<MongoClient>} MongoDB client
 */
async function getClient() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client;
}

/**
 * Retrieve relevant chunks from knowledge base using vector search
 * @param {string} query - User query to search for
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} Array of relevant chunks with scores
 */
export async function retrieveRelevantChunks(query, k = 3) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  const mongoClient = await getClient();

  const collection = mongoClient
    .db(DB_NAME)
    .collection(COLLECTION_NAME);

  try {
    // 1. Create embedding for the user query
    console.log(`🔍 Searching for: "${query}"`);
    
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query
    });

    const queryVector = embeddingResponse.data[0].embedding;

    // 2. Perform vector search in MongoDB
    const results = await collection.aggregate([
      {
        $vectorSearch: {
          index: "default",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: k
        }
      },
      {
        $project: {
          content: 1,
          source: 1,
          score: { $meta: "vectorSearchScore" },
          _id: 0
        }
      }
    ]).toArray();

    console.log(`✅ Found ${results.length} relevant chunks`);
    
    return results;
  } catch (error) {
    console.error("❌ Error during retrieval:", error.message);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    console.log("✅ MongoDB connection closed");
  }
}

/**
 * Search and format results for display
 * @param {string} query - Search query
 * @param {number} k - Number of results
 * @returns {Promise<string>} Formatted context string
 */
export async function searchKnowledgeBase(query, k = 3) {
  const results = await retrieveRelevantChunks(query, k);
  
  if (results.length === 0) {
    return "No relevant information found in the knowledge base.";
  }

  // Combine chunks into context
  const context = results
    .map((result, idx) => {
      return `[Source ${idx + 1}] (Score: ${result.score.toFixed(3)})\n${result.content}`;
    })
    .join("\n\n---\n\n");

  return context;
}

// Test retrieval if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testQuery = process.argv[2] || "How does shipping work?";
  
  searchKnowledgeBase(testQuery)
    .then((context) => {
      console.log("\n📝 Retrieved Context:\n");
      console.log(context);
      return closeConnection();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
