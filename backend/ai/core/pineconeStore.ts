/**
 * Pinecone Vector Store implementation
 * Mocks ChromaDB's API surface but backed by Pinecone
 */
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.PINECONE_API_KEY || "pcsk_6CpFxg_388Frk58C5N3NWqbBU7Jnt93vsc4DqfA4SAjCFrJr7JdUKpScgL42Cug2AwFN7s";
const indexName = process.env.PINECONE_INDEX_NAME || "nexis";

let pcClient = null;

async function getPineconeClient() {
    if (!pcClient) {
        pcClient = new Pinecone({ apiKey });

        const existingIndexes = await pcClient.listIndexes();
        const indexExists = existingIndexes.indexes?.some(i => i.name === indexName);

        if (!indexExists) {
            console.log(`Creating Pinecone index: ${indexName} (dimension: 1024, metric: cosine)...`);
            await pcClient.createIndex({
                name: indexName,
                dimension: 1024,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    return pcClient;
}

export async function getCollection() {
    const pc = await getPineconeClient();
    const index = pc.index(indexName);

    return {
        query: async ({ queryEmbeddings, nResults }) => {
            const queryVector = queryEmbeddings[0];

            const queryResponse = await index.query({
                vector: queryVector,
                topK: nResults,
                includeMetadata: true,
                includeValues: false,
            });

            const documents = [[]];
            const metadatas = [[]];
            const distances = [[]];

            if (queryResponse.matches) {
                queryResponse.matches.forEach(match => {
                    const metadata = match.metadata || {};
                    const docContent = metadata._document || "";

                    const returnMetadata = { ...metadata };
                    delete returnMetadata._document;

                    documents[0].push(docContent);
                    metadatas[0].push(returnMetadata);
                    distances[0].push(1.0 - (match.score || 0));
                });
            }

            return { documents, metadatas, distances };
        },

        delete: async ({ where }) => {
            // Document deletion by metadata is skipped on Serverless. 
        },

        add: async ({ ids, embeddings, metadatas, documents }) => {
            if (!ids || ids.length === 0) return;

            const records = ids.map((id, idx) => {
                const metadata = metadatas[idx] ? { ...metadatas[idx] } : {};
                metadata._document = documents[idx];

                Object.keys(metadata).forEach(key => {
                    if (typeof metadata[key] === 'object' && metadata[key] !== null) {
                        metadata[key] = JSON.stringify(metadata[key]);
                    }
                });

                return {
                    id: id,
                    values: embeddings[idx],
                    metadata: metadata
                };
            });

            const batchSize = 100;
            for (let i = 0; i < records.length; i += batchSize) {
                const batch = records.slice(i, i + batchSize);
                // MUST PASS OBJECT WITH records ARRAY
                await index.upsert({ records: batch });
            }
        }
    };
}
