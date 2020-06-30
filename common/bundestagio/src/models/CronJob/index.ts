import mongoose, { Model } from "mongoose";
import CronJobSchema, { ICronJob } from "./schema";

export const CronJobModel = mongoose.model<ICronJob>("CronJob", CronJobSchema);
export { CronJobSchema, ICronJob };
