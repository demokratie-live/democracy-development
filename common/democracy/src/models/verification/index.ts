import { typedModel } from "ts-mongoose";
import VerificationSchema from "./schema";

export const VerificationModel = typedModel("Verification", VerificationSchema);
export { VerificationSchema };
