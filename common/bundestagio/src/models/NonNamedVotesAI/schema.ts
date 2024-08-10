import { Schema, SchemaTimestampsConfig, Document } from 'mongoose';

export interface INonNamedVotesAi extends Document, SchemaTimestampsConfig {
  pdfUrl: string;
  assistantId?: string;
  vectorStoreId?: string;
  threadId?: string;
  fileId?: string;
}

const NonNamedVotesAiSchema = new Schema<INonNamedVotesAi>(
  {
    pdfUrl: { type: String, unique: true, index: true, required: true },
    assistantId: { type: String },
    vectorStoreId: { type: String },
    threadId: { type: String },
    fileId: { type: String },
  },
  { timestamps: true },
);

export default NonNamedVotesAiSchema;
