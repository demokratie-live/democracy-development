import { Schema } from 'mongoose';

const PartyVotesSchema = new Schema(
  {
    party: { type: String, es_indexed: false },
    main: {
      type: String,
      es_indexed: false,
      enum: ['YES', 'NO', 'ABSTINATION'],
    },
    deviants: {
      yes: Number,
      abstination: Number,
      no: Number,
    },
  },
  { _id: false },
);

export default PartyVotesSchema;
