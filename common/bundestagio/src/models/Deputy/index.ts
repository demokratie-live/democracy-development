import mongoose from "mongoose";
import DeputySchema from "./schema";

export const DeputyModel = mongoose.model("Deputy", DeputySchema);
