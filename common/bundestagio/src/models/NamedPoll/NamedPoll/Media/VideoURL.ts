import { Schema } from "mongoose";

export interface INamedPollMediaVideoURL {
  URL: string;
  description: string;
}

const NamedPollMediaVideoURL = new Schema(
  {
    URL: { type: String },
    description: { type: String },
  },
  { _id: false }
);

export default NamedPollMediaVideoURL;
