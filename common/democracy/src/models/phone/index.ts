import { model } from "mongoose";
import PhoneSchema, { Phone } from "./schema";

export default model<Phone>("Phone", PhoneSchema);
export { Phone, PhoneSchema };
