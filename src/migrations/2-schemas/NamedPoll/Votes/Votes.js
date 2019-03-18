import { Schema } from 'mongoose';

const NamedPollVotesVotes = new Schema(
  {
    total: { type: Number },
    yes: { type: Number },
    no: { type: Number },
    abstain: { type: Number },
    na: { type: Number },
  },
  { _id: false },
);

export default NamedPollVotesVotes;
