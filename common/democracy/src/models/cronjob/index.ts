import CronJobSchema, { ICronJob } from "./schema";
import { model } from "mongoose";

export const CronJobModel = model<ICronJob>("CronJob", CronJobSchema);
export { CronJobSchema, ICronJob };
