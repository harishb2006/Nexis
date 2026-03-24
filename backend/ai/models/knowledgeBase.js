import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      description: 'The text chunk from the document'
    },
    embedding: {
      type: [Number],
      required: true,
      description: 'Cohere embedding vector (1024 dimensions for embed-english-v3.0)'
    },
    source: {
      type: String,
      required: true,
      description: 'Source file path or document name'
    },
    metadata: {
      type: Object,
      default: {},
      description: 'Additional metadata about the chunk'
    },
    chunkIndex: {
      type: Number,
      description: 'Position of this chunk in the original document'
    }
  },
  {
    timestamps: true,
    collection: 'knowledge_base'
  }
);

// Standard indexes for regular queries
knowledgeBaseSchema.index({ source: 1 });
knowledgeBaseSchema.index({ createdAt: -1 });

/**
 * MONGODB ATLAS VECTOR SEARCH INDEX CONFIGURATION
 * 
 * To enable vector search, create the following index in MongoDB Atlas:
 * 
 * 1. Go to your MongoDB Atlas cluster
 * 2. Navigate to "Atlas Search" tab
 * 3. Click "Create Search Index"
 * 4. Choose "JSON Editor" and use this configuration:
 * 
 * {
 *   "name": "vector_index",
 *   "type": "vectorSearch",
 *   "definition": {
 *     "fields": [
 *       {
 *         "type": "vector",
 *         "path": "embedding",
 *         "numDimensions": 1024,
 *         "similarity": "cosine"
 *       }
 *     ]
 *   }
 * }
 * 
 * 5. Select the "knowledge_base" collection
 * 6. Click "Create Index"
 * 
 * The index name MUST be "vector_index" to match the retriever.js configuration.
 */

export default mongoose.model('KnowledgeBase', knowledgeBaseSchema);

/**
 * Helper function to check if vector search index exists
 * Can be used for health checks
 */
export async function checkVectorSearchIndex() {
  try {
    const db = mongoose.connection.db;
    const indexes = await db.collection('knowledge_base').listSearchIndexes().toArray();
    const vectorIndex = indexes.find(idx => idx.name === 'vector_index');
    
    if (vectorIndex) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
