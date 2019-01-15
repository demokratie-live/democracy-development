import mongoose, { Schema } from 'mongoose';
// import diffHistory from 'mongoose-diff-history/diffHistory';

const DeputySchema = new Schema(
  {
    URL: { type: String, required: true },
    webId: { type: String },
    img: { type: String },
    party: { type: String },
    name: { type: String, required: true },
    job: { type: String },
    office: [{ type: String }],
    links: [
      {
        name: { type: String },
        link: { type: String },
      },
    ],
    biography: [{ type: String }],
    constituency: { type: String },
    constituencyName: { type: String },
    functions: [
      {
        category: { type: String },
        functions: [{ type: String }],
      },
    ],
    speechesURL: { type: String },
    votesURL: { type: String },
    publicationRequirement: [{ type: String }],
  },
  { timestamps: true },
);

// Gives diffs for array - need index?
// DeputySchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });
export default mongoose.model('Deputy', DeputySchema);
