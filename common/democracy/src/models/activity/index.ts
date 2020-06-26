import { model } from "mongoose";
import ActivitySchema, { Activity } from "./schema";

export const ActivityModel = model<Activity>("Activity", ActivitySchema);
export { ActivitySchema, Activity };
