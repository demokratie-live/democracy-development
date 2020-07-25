import mongoose from "mongoose";
import ConferenceWeekDetailSchema, { IConferenceWeekDetail } from "./schema";

export const ConferenceWeekDetailModel = mongoose.model<IConferenceWeekDetail>(
  "ConferenceWeekDetail",
  ConferenceWeekDetailSchema
);
