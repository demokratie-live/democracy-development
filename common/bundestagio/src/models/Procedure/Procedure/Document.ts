import { Schema } from "mongoose";

export interface IDocument {
  editor: string;
  number: string;
  type: string;
  url: string;
}

const DocumentSchema = new Schema(
  {
    editor: String,
    number: String,
    type: String,
    url: String,
  },
  { _id: false }
);

export default DocumentSchema;
