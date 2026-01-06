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
      description: 'Cohere embedding vector (1024 dimensions)'
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

// Create index for vector search (MongoDB Atlas Search)
knowledgeBaseSchema.index({ embedding: 1 });
knowledgeBaseSchema.index({ source: 1 });

export default mongoose.model('KnowledgeBase', knowledgeBaseSchema);
