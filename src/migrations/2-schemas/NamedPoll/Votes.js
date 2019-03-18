import { Schema } from 'mongoose';

import NamedPollVotesVotes from './Votes/Votes';
import NamedPollVotesParty from './Votes/Party';
import NamedPollVotesDeputy from './Votes/Deputy';

const NamedPollVotes = new Schema(
  {
    all: NamedPollVotesVotes,
    parties: [NamedPollVotesParty],
    deputies: [NamedPollVotesDeputy],
    inverseVoteDirection: { type: Boolean },
  },
  { _id: false },
);

export default NamedPollVotes;
