import mongoose, { Schema } from "mongoose";

export interface ProcedureDocument extends mongoose.Document {
  editor?: string;
  number?: string;
  type?: string;
  url?: string;
}

const DocumentSchema = new Schema<ProcedureDocument>(
  {
    editor: String,
    number: { type: String, index: true },
    type: String,
    url: String,
  },
  { _id: false }
);

export default DocumentSchema;
