/**
 * AI Module Test Script
 * Quick verification that all modules load correctly
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testModules() {
  console.log("🧪 Testing AI Module Structure\n");
  console.log("=".repeat(50));

  try {
    // Test 1: Config
    console.log("\n1️⃣ Testing Config...");
    const { config, validateConfig } = await import("../ai/index.js");
    console.log("   ✅ Config loaded");
    console.log(`   - LLM Model: ${config.llm.model}`);
    console.log(`   - Embeddings Model: ${config.embeddings.model}`);
    console.log(`   - Config Valid: ${validateConfig()}`);

    // Test 2: Core modules
    console.log("\n2️⃣ Testing Core Modules...");
    const { getClient, convertTools } = await import("../ai/core/index.js");
    console.log("   ✅ LLM client available");
    console.log("   ✅ Tool converter available");

    // Test 3: Tools
    console.log("\n3️⃣ Testing Tools...");
    const { allTools, getToolsForLLM } = await import("../ai/tools/index.js");
    console.log(`   ✅ ${allTools.length} tools loaded`);
    allTools.forEach((t) => console.log(`      - ${t.name}`));

    // Test 4: Agent
    console.log("\n4️⃣ Testing Agent...");
    const { createSupportAgent } = await import("../ai/agents/index.js");
    const agent = createSupportAgent();
    console.log("   ✅ Support agent created");

    // Test 5: Memory
    console.log("\n5️⃣ Testing Memory Service...");
    const { MemoryService, generateThreadId } = await import("../ai/memory/index.js");
    console.log(`   ✅ Memory service available`);
    console.log(`   - Sample thread ID: ${generateThreadId()}`);

    // Test 6: RAG (skip actual retrieval, just check import)
    console.log("\n6️⃣ Testing RAG...");
    const { retrieveRelevantChunks, ingestFromUploads } = await import("../ai/rag/index.js");
    console.log("   ✅ RAG retriever available");
    console.log("   ✅ Document ingestion available");

    // Test 7: Routes
    console.log("\n7️⃣ Testing Routes...");
    const { chatRouter, streamingRouter } = await import("../ai/routes/index.js");
    console.log("   ✅ Chat router loaded");
    console.log("   ✅ Streaming router loaded");

    console.log("\n" + "=".repeat(50));
    console.log("✅ All modules loaded successfully!");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

testModules();
