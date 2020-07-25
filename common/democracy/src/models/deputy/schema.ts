import { Schema, Document } from "mongoose";
import DeputyContact, { IDeputyContact } from "./Contact";
import DeputyVote, { IDeputyVote } from "./schema-vote";
import { Timestamps } from "../timestamp";

export interface IDeputy extends Document, Timestamps {
  webId: string;
  imgURL: string;
  name: string;
  party?: string | null;
  job?: string | null;
  biography?: string | null;
  constituency?: string | null;
  directCandidate?: boolean | null;
  contact?: IDeputyContact | null;
  votes: IDeputyVote[];
}

const DeputySchema = new Schema(
  {
    webId: { type: String, required: true, unique: true, index: true },
    imgURL: { type: String, required: true },
    name: { type: String, required: true },
    party: { type: String },
    job: { type: String },
    biography: { type: String },
    constituency: { type: String },
    directCandidate: { type: Boolean },
    contact: { type: DeputyContact },
    votes: [{ type: DeputyVote }],
  },
  { timestamps: true }
);

export default DeputySchema;
