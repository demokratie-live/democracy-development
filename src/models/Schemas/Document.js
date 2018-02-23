import { Schema } from 'mongoose';

const DocumentSchema = new Schema(
  {
    editor: String,
    number: String,
    type: String,
    url: String,
  },
  { _id: false },
);

export default DocumentSchema;
