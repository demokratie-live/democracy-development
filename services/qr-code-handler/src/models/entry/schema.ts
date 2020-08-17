import { Schema, Document, SchemaTimestampsConfig } from "mongoose";

export interface Entry extends Document, SchemaTimestampsConfig {
  code: string;
}

const EntrySchema = new Schema<Entry>(
  {
    code: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

EntrySchema.index({ code: 1 });

export default EntrySchema;
