import { Schema } from "mongoose";

export interface IPlenum {
  editor: string;
  number: string;
  type: string;
  url: string;
}

const PlenumSchema = new Schema(
  {
    type: String,
    editor: String,
    number: String,
    pages: String,
    link: String,
  },
  { _id: false }
);

export default PlenumSchema;
