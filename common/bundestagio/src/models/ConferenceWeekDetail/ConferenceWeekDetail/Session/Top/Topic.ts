import { Schema } from "mongoose";

export interface ITopic {
  lines: string[];
  documents: string[];
  isVote: boolean | null;
  procedureIds: string[];
}

const ConferenceWeekDetailSessionTopTopic = new Schema(
  {
    lines: [String],
    documents: [String],
    isVote: { type: Boolean, default: null },
    procedureIds: [String],
  },
  { _id: false }
);

export default ConferenceWeekDetailSessionTopTopic;
