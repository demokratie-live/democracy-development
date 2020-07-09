import { Schema, Document, SchemaTimestampsConfig } from "mongoose";
import diffHistory from "mongoose-diff-history/diffHistory";

import DeputyLink, { IDeputyLink } from "./Deputy/Link";
import DeputyFunctions, { IDeputyFunctions } from "./Deputy/Functions";

export interface IDeputy {
  URL: string;
  webId: string;
  imgURL?: string;
  party?: string;
  name: string;
  job?: string;
  office: string[];
  links: IDeputyLink[];
  biography: string[];
  constituency?: string;
  constituencyName?: string;
  directCandidate?: boolean;
  functions: IDeputyFunctions[];
  speechesURL?: string;
  votesURL?: string;
  publicationRequirement: string[];
}

export type DeputyDoc = IDeputy & Document & SchemaTimestampsConfig;

const DeputySchema = new Schema<DeputyDoc>(
  {
    URL: { type: String, required: true, unique: true, index: true },
    webId: { type: String, required: true, unique: true, index: true },
    imgURL: { type: String },
    party: { type: String },
    name: { type: String, required: true },
    job: { type: String },
    office: [{ type: String }],
    links: [DeputyLink],
    biography: [{ type: String }],
    constituency: { type: String },
    constituencyName: { type: String },
    directCandidate: { type: Boolean },
    functions: [DeputyFunctions],
    speechesURL: { type: String },
    votesURL: { type: String },
    publicationRequirement: [{ type: String }],
  },
  { timestamps: true }
);

DeputySchema.plugin(diffHistory.plugin, { omit: ["updatedAt"] });

DeputySchema.index({ createdAt: 1 });

export default DeputySchema;
