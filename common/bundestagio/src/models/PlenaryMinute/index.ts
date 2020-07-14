import mongoose from "mongoose";
import PlenaryMinuteSchema, {
  PlenaryMinuteDoc,
  IPlenaryMinute,
} from "./schema";

export const PlenaryMinuteModel = mongoose.model<PlenaryMinuteDoc>(
  "PlenaryMinute",
  PlenaryMinuteSchema
);

export { IPlenaryMinute };
