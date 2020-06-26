import ProcedureSchema, { IProcedure, PartyVotes } from "./schema";
import { model } from "mongoose";

export const ProcedureModel = model<IProcedure>("Procedure", ProcedureSchema);
export { ProcedureSchema, IProcedure, PartyVotes };
