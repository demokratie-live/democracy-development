import { Schema } from 'mongoose';

const ConferenceWeekDetailSessionTopTopic = new Schema(
  {
    lines: [String],
    documents: [String],
    isVote: { type: Boolean, default: null },
    procedureIds: [String],
  },
  { _id: false },
);

export default ConferenceWeekDetailSessionTopTopic;
