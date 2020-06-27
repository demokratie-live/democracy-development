import { model, Model } from "mongoose";
import ActivitySchema, { Activity } from "./schema";

export const ActivityModel = model<Activity>(
  "Activity",
  ActivitySchema
) as Model<Activity, {}>;
export { ActivitySchema, Activity };
