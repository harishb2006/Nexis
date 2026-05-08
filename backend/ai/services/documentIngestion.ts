import { ingestFromUploads } from "../rag/ingestion.js";

async function run() {
    console.log("Starting ingestion...");
    try {
        const result = await ingestFromUploads();
        console.log("Ingestion completed successfully:");
        console.log(`Processed files: ${result.files.length}`);
        console.log(`Total chunks: ${result.chunksIngested}`);
        process.exit(0);
    } catch (error) {
        console.error("Ingestion failed:", error);
        process.exit(1);
    }
}

run();
