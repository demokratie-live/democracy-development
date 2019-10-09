import { Schema } from 'mongoose';

const ConferenceWeekDetailSessionTopStatus = new Schema(
  {
    line: { type: String },
    documents: [String],
  },
  { _id: false },
);

export default ConferenceWeekDetailSessionTopStatus;
