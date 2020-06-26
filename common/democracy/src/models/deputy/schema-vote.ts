import { Schema } from "mongoose";
import { VoteSelection } from "../vote";

export interface IDeputyVote {
  procedureId: string;
  decision: VoteSelection;
}

const DeputyVoteSchema = new Schema<IDeputyVote>(
  {
    procedureId: { type: String, required: true },
    decision: {
      type: String,
      enum: ["YES", "NO", "ABSTINATION", "NOTVOTED"],
      required: true,
    },
  },
  { _id: false }
);

export default DeputyVoteSchema;
