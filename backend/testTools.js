import { generateAnswer } from "./ai/services/chatServiceWithTools.js";
import dotenv from "dotenv";

dotenv.config();

const testQuestions = [
  "What categories do you have?",
  "Show me electronics products",
  "Do you have any fashion items?",
  "What are your return policies?",
  "Can I get a student discount?"
];

console.log("🧪 Testing Week 2: Action Layer (Tools)\n");
console.log("=".repeat(70));

async function runTests() {
  for (const question of testQuestions) {
    console.log(`\n\n📌 Question: "${question}"`);
    console.log("-".repeat(70));
    
    try {
      const result = await generateAnswer(question);
      
      console.log("\n💬 Answer:");
      console.log(result.answer);
      
      if (result.toolsUsed && result.toolsUsed.length > 0) {
        console.log("\n🛠️  Tools Used:");
        result.toolsUsed.forEach(tool => {
          console.log(`   ✓ ${tool.tool}`);
        });
      } else {
        console.log("\n📚 Used knowledge base only (no tools needed)");
      }
      
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
    
    console.log("\n" + "-".repeat(70));
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n\n✅ All tests completed!");
  console.log("=".repeat(70));
  process.exit(0);
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
