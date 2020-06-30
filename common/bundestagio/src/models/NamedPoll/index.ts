import mongoose from "mongoose";
import NamedPollSchema from "./schema";

export const NamedPollModel = mongoose.model("NamedPoll", NamedPollSchema);
