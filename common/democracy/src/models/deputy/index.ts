import DeputySchema, { IDeputy } from "./schema";
import { IDeputyVote } from "./schema-vote";
import { model, Model } from "mongoose";

export const DeputyModel = model<IDeputy>("Deputy", DeputySchema) as Model<
  IDeputy,
  {}
>;
export { DeputySchema, IDeputy, IDeputyVote };
