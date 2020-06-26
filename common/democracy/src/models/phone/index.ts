import { model } from "mongoose";
import PhoneSchema, { Phone } from "./schema";

export const PhoneModel = model<Phone>("Phone", PhoneSchema);
export { Phone, PhoneSchema };
