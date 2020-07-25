import { Schema } from "mongoose";

import NamedPollVotesVotes, { INamedPollVotesVotes } from "./Votes/Votes";
import NamedPollVotesParty, { INamedPollVotesParty } from "./Votes/Party";
import NamedPollVotesDeputy, { INamedPollVotesDeputy } from "./Votes/Deputy";

export interface INamedPollVotes {
  all: INamedPollVotesVotes;
  parties: INamedPollVotesParty[];
  deputies: INamedPollVotesDeputy[];
  inverseVoteDirection: boolean;
}

const NamedPollVotes = new Schema(
  {
    all: NamedPollVotesVotes,
    parties: [NamedPollVotesParty],
    deputies: [NamedPollVotesDeputy],
    inverseVoteDirection: { type: Boolean },
  },
  { _id: false }
);

export default NamedPollVotes;
