import { Schema } from "mongoose";

export interface INamedPollVotesVotes {
  total?: number;
  yes?: number;
  no?: number;
  abstain?: number;
  na?: number;
}

const NamedPollVotesVotes = new Schema(
  {
    total: { type: Number },
    yes: { type: Number },
    no: { type: Number },
    abstain: { type: Number },
    na: { type: Number },
  },
  { _id: false }
);

export default NamedPollVotesVotes;
