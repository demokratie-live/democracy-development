import mongoose, { Model } from "mongoose";
import CronJobSchema, { ICronJob, ConferenceWeeCronJobkData } from "./schema";

export const CronJobModel = mongoose.model<ICronJob>("CronJob", CronJobSchema);
export { CronJobSchema, ICronJob, ConferenceWeeCronJobkData };
