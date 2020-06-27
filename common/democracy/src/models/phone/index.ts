import { model, Model } from "mongoose";
import PhoneSchema, { Phone } from "./schema";

export const PhoneModel = model<Phone>("Phone", PhoneSchema) as Model<
  Phone,
  {}
>;
export { Phone, PhoneSchema };
