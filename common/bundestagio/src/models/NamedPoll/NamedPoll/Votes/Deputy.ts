import { Schema } from "mongoose";

export interface INamedPollVotesDeputy {
  webId: string;
  URL?: string;
  imgURL?: string;
  state?: string;
  name?: string;
  party?: string;
  vote?: string;
}

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
  { _id: false }
);

export default NamedPollVotesDeputy;
