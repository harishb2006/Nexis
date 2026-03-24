/**
 * Local JSON Vector Store
 * A simple 0-dependency persistent vector database
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cosineSimilarity } from "./embeddings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const storeDir = path.join(__dirname, "../../knowledge_data");
if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
}

const STORE_PATH = path.join(storeDir, "vectors.json");

/**
 * Loads the current store from disk
 */
function loadStore() {
    if (!fs.existsSync(STORE_PATH)) {
        return {
            ids: [],
            embeddings: [],
            metadatas: [],
            documents: []
        };
    }
    const rawData = fs.readFileSync(STORE_PATH, 'utf-8');
    try {
        return JSON.parse(rawData);
    } catch (e) {
        console.error("Error reading JSON vector store:", e);
        return {
            ids: [],
            embeddings: [],
            metadatas: [],
            documents: []
        };
    }
}

/**
 * Saves the store to disk
 */
function saveStore(data) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data), 'utf-8');
}

/**
 * A Collection object that mocks ChromaDB's API surface
 */
export async function getCollection() {
    return {
        query: async ({ queryEmbeddings, nResults }) => {
            const store = loadStore();
            if (store.ids.length === 0) {
                return { documents: [[]], metadatas: [[]], distances: [[]] };
            }

            const queryVector = queryEmbeddings[0]; // Assume 1 query vector

            // Calculate similarities for all vectors
            const scoredResults = store.ids.map((id, index) => {
                const docVector = store.embeddings[index];
                const similarity = cosineSimilarity(queryVector, docVector);
                return {
                    id: id,
                    index: index,
                    distance: 1.0 - similarity // Mocking Chroma distance
                };
            });

            // Sort by distance (lowest is best, i.e., highest similarity)
            scoredResults.sort((a, b) => a.distance - b.distance);

            // Get top K
            const topResults = scoredResults.slice(0, nResults);

            const documents = [[]];
            const metadatas = [[]];
            const distances = [[]];

            topResults.forEach(res => {
                documents[0].push(store.documents[res.index]);
                metadatas[0].push(store.metadatas[res.index]);
                distances[0].push(res.distance);
            });

            return { documents, metadatas, distances };
        },

        delete: async ({ where }) => {
            const store = loadStore();

            // Handle { source: "..." } or { fileName: "..." }
            const keyToMatch = Object.keys(where)[0];
            const valueToMatch = where[keyToMatch];

            const indicesToDelete = new Set();
            for (let i = 0; i < store.metadatas.length; i++) {
                if (store.metadatas[i][keyToMatch] === valueToMatch) {
                    indicesToDelete.add(i);
                }
            }

            if (indicesToDelete.size > 0) {
                const newStore = { ids: [], embeddings: [], metadatas: [], documents: [] };
                for (let i = 0; i < store.ids.length; i++) {
                    if (!indicesToDelete.has(i)) {
                        newStore.ids.push(store.ids[i]);
                        newStore.embeddings.push(store.embeddings[i]);
                        newStore.metadatas.push(store.metadatas[i]);
                        newStore.documents.push(store.documents[i]);
                    }
                }
                saveStore(newStore);
            }
        },

        add: async ({ ids, embeddings, metadatas, documents }) => {
            const store = loadStore();
            store.ids.push(...ids);
            store.embeddings.push(...embeddings);
            store.metadatas.push(...metadatas);
            store.documents.push(...documents);
            saveStore(store);
        }
    };
}
