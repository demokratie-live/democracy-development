import { Schema } from 'mongoose';

import NamedPollVotesVotes from './Votes';

const NamedPollVotesParty = new Schema(
  {
    name: { type: String, required: true, index: true },
    votes: NamedPollVotesVotes,
  },
  { _id: false },
);

export default NamedPollVotesParty;
