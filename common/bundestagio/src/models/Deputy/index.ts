import mongoose from "mongoose";
import DeputySchema, { IDeputy, DeputyDoc } from "./schema";

export const DeputyModel = mongoose.model<DeputyDoc>("Deputy", DeputySchema);

export { IDeputy };
