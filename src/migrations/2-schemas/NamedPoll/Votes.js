import { Schema } from 'mongoose';

import NamedPollVotesVotes from './Votes/Votes';
import NamedPollVotesParty from './Votes/Party';

const NamedPollVotes = new Schema(
  {
    all: NamedPollVotesVotes,
    parties: [NamedPollVotesParty],
  },
  { _id: false },
);

export default NamedPollVotes;
