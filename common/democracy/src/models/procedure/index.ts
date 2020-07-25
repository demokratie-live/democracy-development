import ProcedureSchema, { IProcedure, PartyVotes } from "./schema";
import { model, Model } from "mongoose";

export const ProcedureModel = model<IProcedure>(
  "Procedure",
  ProcedureSchema
) as Model<IProcedure, {}>;
export { ProcedureSchema, IProcedure, PartyVotes };
