import VoteSchema, { Vote } from "./schema";
import { model, Model } from "mongoose";

export const VoteModel = model<Vote>("Vote", VoteSchema) as Model<Vote, {}>;
export { VoteSchema, Vote };
export * from "./types";
