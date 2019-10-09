import { Schema } from 'mongoose';
import diffHistory from 'mongoose-diff-history/diffHistory';

import Session from './ConferenceWeekDetail/Session';

const ConferenceWeekDetailSchema = new Schema(
  {
    URL: { type: String, default: null },
    id: { type: String, required: true, unique: true, index: true },
    previousYear: { type: Number, default: null },
    previousWeek: { type: Number, default: null },
    thisYear: { type: Number, required: true },
    thisWeek: { type: Number, required: true },
    nextYear: { type: Number, default: null },
    nextWeek: { type: Number, default: null },
    sessions: [Session],
  },
  { timestamps: true },
);

// TODO We ignore the URL here since this is an error from Bundestag generating unnessecary history entries
ConferenceWeekDetailSchema.plugin(diffHistory.plugin, { omit: ['updatedAt', 'URL'] });
ConferenceWeekDetailSchema.index({ createdAt: 1 });
ConferenceWeekDetailSchema.index({ previousYear: 1, previousWeek: 1 }, { unique: true });
ConferenceWeekDetailSchema.index({ thisYear: 1, thisWeek: 1 }, { unique: true });
ConferenceWeekDetailSchema.index({ nextYear: 1, nextWeek: 1 }, { unique: true });

export default ConferenceWeekDetailSchema;
