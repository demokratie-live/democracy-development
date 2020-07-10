import { Schema } from "mongoose";

export interface IDeputyLink {
  name: string;
  URL: string;
  username?: string;
}

const DeputyLinkSchema = new Schema<IDeputyLink>(
  {
    name: { type: String },
    URL: { type: String },
    username: { type: String },
  },
  { _id: false }
);

export default DeputyLinkSchema;
