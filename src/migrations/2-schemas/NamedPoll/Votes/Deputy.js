import { Schema } from 'mongoose';

const NamedPollVotesDeputy = new Schema(
  {
    webId: { type: String, required: true, index: true },
    URL: { type: String },
    imgURL: { type: String },
    state: { type: String },
    name: { type: String },
    party: { type: String },
    vote: { type: String },
  },
  { _id: false },
);

export default NamedPollVotesDeputy;
