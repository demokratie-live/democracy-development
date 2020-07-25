import CronJobSchema, { ICronJob } from "./schema";
import { model, Model } from "mongoose";

export const CronJobModel = model<ICronJob>("CronJob", CronJobSchema) as Model<
  ICronJob,
  {}
>;
export { CronJobSchema, ICronJob };
