import { Schema, Document, SchemaTimestampsConfig } from "mongoose";
import diffHistory from "mongoose-diff-history/diffHistory";

import Session, { ISession } from "./ConferenceWeekDetail/Session";

export interface IConferenceWeekDetail
  extends Document,
    SchemaTimestampsConfig {
  URL: string | null;
  id: string;
  previousYear: number | null;
  previousWeek: number | null;
  thisYear: number;
  thisWeek: number;
  nextYear: number | null;
  nextWeek: number | null;
  sessions: ISession[];
}

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
  { timestamps: true }
);

// TODO We ignore the URL here since this is an error from Bundestag generating unnessecary history entries
ConferenceWeekDetailSchema.plugin(diffHistory.plugin, {
  omit: ["updatedAt", "URL"],
});
ConferenceWeekDetailSchema.index({ createdAt: 1 });
ConferenceWeekDetailSchema.index(
  { previousYear: 1, previousWeek: 1 },
  { unique: true }
);
ConferenceWeekDetailSchema.index(
  { thisYear: 1, thisWeek: 1 },
  { unique: true }
);
ConferenceWeekDetailSchema.index(
  { nextYear: 1, nextWeek: 1 },
  { unique: true }
);

export default ConferenceWeekDetailSchema;
