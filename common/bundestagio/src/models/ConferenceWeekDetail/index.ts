import mongoose from "mongoose";
import ConferenceWeekDetailSchema from "./schema";

export const ConferenceWeekDetailModel = mongoose.model(
  "ConferenceWeekDetail",
  ConferenceWeekDetailSchema
);
