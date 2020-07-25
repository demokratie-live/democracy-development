import { Schema } from "mongoose";

import NamedPollVotesVotes, { INamedPollVotesVotes } from "./Votes";

export interface INamedPollVotesParty {
  name: string;
  votes: INamedPollVotesVotes;
}

const NamedPollVotesParty = new Schema(
  {
    name: { type: String, required: true, index: true },
    votes: NamedPollVotesVotes,
  },
  { _id: false }
);

export default NamedPollVotesParty;
