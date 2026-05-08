#!/usr/bin/env node

/**
 * Test script for LangGraph Agent
 * Tests the complete autonomous agent workflow
 */

import { executeAgent } from "./ai/services/langgraphAgent.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Test scenarios
const testCases = [
  {
    name: "Product Search (Tool Required)",
    question: "What electronics do you have?",
    expectedTools: ["search_products"]
  },
  {
    name: "Policy Question (RAG Only)",
    question: "What is your shipping policy?",
    expectedTools: []
  },
  {
    name: "Order Status (Tool + Auth)",
    question: "Check order status for 507f1f77bcf86cd799439011",
    expectedTools: ["check_order"]
  },
  {
    name: "Refund Eligibility (Multi-step)",
    question: "Can I return order 507f1f77bcf86cd799439011?",
    expectedTools: ["check_refund_eligibility"]
  },
  {
    name: "Frustrated Customer (Sentiment + Escalation)",
    question: "This is terrible! I'm so frustrated with my order!",
    expectedTools: [] // Should detect sentiment but may not escalate automatically
  }
];

async function runTest(testCase) {
  console.log("\n" + "=".repeat(70));
  console.log(`🧪 TEST: ${testCase.name}`);
  console.log("=".repeat(70));
  console.log(`📝 Question: ${testCase.question}\n`);

  try {
    const startTime = Date.now();
    
    const result = await executeAgent(testCase.question, [], {
      userId: "test-user-123",
      email: "test@example.com",
      threadId: `test-${Date.now()}`
    });

    const duration = Date.now() - startTime;

    console.log("\n✅ RESULTS:");
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (result.sentiment && result.sentiment.isNegative) {
      console.log(`\n⚠️  SENTIMENT DETECTED:`);
      console.log(`   Keywords: ${result.sentiment.keywords.join(', ')}`);
      console.log(`   Severity: ${result.sentiment.severity}`);
    }

    if (result.sources && result.sources.length > 0) {
      console.log(`\n📚 KNOWLEDGE BASE SOURCES (${result.sources.length}):`);
      result.sources.forEach((source, idx) => {
        console.log(`   ${idx + 1}. [${source.relevance}] ${source.content.substring(0, 80)}...`);
      });
    }

    if (result.toolsUsed && result.toolsUsed.length > 0) {
      console.log(`\n🛠️  TOOLS USED (${result.toolsUsed.length}):`);
      result.toolsUsed.forEach((tool, idx) => {
        console.log(`   ${idx + 1}. ${tool.tool}`);
        console.log(`      Args:`, tool.args);
        console.log(`      Success: ${tool.result.success !== false ? '✅' : '❌'}`);
        if (tool.result.message) {
          console.log(`      Message: ${tool.result.message}`);
        }
      });
      
      // Verify expected tools were used
      const usedToolNames = result.toolsUsed.map(t => t.tool);
      const hasExpectedTools = testCase.expectedTools.every(expected => 
        usedToolNames.includes(expected)
      );
      
      if (testCase.expectedTools.length > 0) {
        if (hasExpectedTools) {
          console.log(`\n   ✅ Expected tools were used`);
        } else {
          console.log(`\n   ⚠️  Expected: [${testCase.expectedTools.join(', ')}]`);
          console.log(`   ⚠️  Got: [${usedToolNames.join(', ')}]`);
        }
      }
    } else if (testCase.expectedTools.length > 0) {
      console.log(`\n⚠️  No tools were used (expected: ${testCase.expectedTools.join(', ')})`);
    }

    console.log(`\n💬 FINAL ANSWER:`);
    console.log(`   ${result.answer || 'No answer generated'}`);

    console.log(`\n✅ Test passed!`);
    return { success: true, duration };

  } catch (error) {
    console.error(`\n❌ TEST FAILED:`, error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════════╗");
  console.log("║         🤖 LangGraph Autonomous Agent Test Suite 🤖               ║");
  console.log("╚════════════════════════════════════════════════════════════════════╝");
  
  // Connect to database
  console.log("\n📡 Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }

  // Run tests
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = await runTest(testCase);
    results.push({ ...testCase, ...result });
    
    // Wait between tests
    if (i < testCases.length - 1) {
      console.log("\n⏳ Waiting 2 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log("\n\n");
  console.log("╔════════════════════════════════════════════════════════════════════╗");
  console.log("║                         📊 TEST SUMMARY                            ║");
  console.log("╚════════════════════════════════════════════════════════════════════╝");
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  const avgDuration = totalDuration / results.length;

  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Average Duration: ${Math.round(avgDuration)}ms`);
  console.log(`⏱️  Total Duration: ${Math.round(totalDuration)}ms`);

  results.forEach((result, idx) => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    console.log(`\n${status} Test ${idx + 1}: ${result.name} (${duration})`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log("\n" + "=".repeat(70) + "\n");

  // Disconnect
  await mongoose.disconnect();
  console.log("👋 Database disconnected");
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run tests
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
