import VoteSchema, { Vote } from "./schema";
import { model } from "mongoose";

export const VoteModel = model<Vote>("Vote", VoteSchema);
export { VoteSchema, Vote };
export * from "./types";
