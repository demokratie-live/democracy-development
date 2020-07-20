import mongoose from "mongoose";
import ProcedureSchema, { IProcedure } from "./schema";

const ProcedureModel = mongoose.model<IProcedure>("Procedure", ProcedureSchema);

export { ProcedureModel };
