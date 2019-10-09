import { Schema } from 'mongoose';

import Top from './Session/Top';

const ConferenceWeekDetailSession = new Schema(
  {
    date: { type: Date, default: null },
    dateText: { type: String, default: null },
    session: { type: String, default: null },
    tops: [Top],
  },
  { _id: false },
);

export default ConferenceWeekDetailSession;
