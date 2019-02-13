import { Schema } from 'mongoose';
import diffHistory from 'mongoose-diff-history/diffHistory';

import DeputyLink from './Deputy/Link';
import DeputyFunctions from './Deputy/Functions';

const DeputySchema = new Schema(
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
  { timestamps: true },
);

DeputySchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

DeputySchema.index({ createdAt: 1 });

export default DeputySchema;
