import { model, Model } from "mongoose";
import EntrySchema, { Entry } from "./schema";

export const EntryModel = model<Entry>("Entry", EntrySchema) as Model<
  Entry,
  {}
>;
export { EntrySchema, Entry };
