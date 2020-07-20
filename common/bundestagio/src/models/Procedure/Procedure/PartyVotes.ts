import { Schema } from "mongoose";

export enum VoteDecision {
  Yes = "YES",
  Abstination = "ABSTINATION",
  No = "NO",
  Notvoted = "NOTVOTED",
}

export interface IPartyVotes {
  party: string;
  main?: VoteDecision;
  deviants: {
    yes?: number;
    abstination?: number;
    no?: number;
    notVoted?: number;
  };
}

const PartyVotesSchema = new Schema<IPartyVotes>(
  {
    party: { type: String, es_indexed: false },
    main: {
      type: String,
      es_indexed: false,
      enum: ["YES", "NO", "ABSTINATION", "NOTVOTED"],
    },
    deviants: {
      yes: Number,
      abstination: Number,
      no: Number,
      notVoted: Number,
    },
  },
  { _id: false }
);

export default PartyVotesSchema;
