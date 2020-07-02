import mongoose from "mongoose";
import NamedPollSchema, { INamedPoll } from "./schema";

export const NamedPollModel = mongoose.model<INamedPoll>(
  "NamedPoll",
  NamedPollSchema
);
