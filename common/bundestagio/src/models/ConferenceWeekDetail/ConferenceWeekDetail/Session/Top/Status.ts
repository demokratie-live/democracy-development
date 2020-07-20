import { Schema } from "mongoose";

export interface IStatus {
  line: string;
  documents: string[];
}

const ConferenceWeekDetailSessionTopStatus = new Schema(
  {
    line: { type: String },
    documents: [String],
  },
  { _id: false }
);

export default ConferenceWeekDetailSessionTopStatus;
