import { CronJobModel, ICronJob } from "../models";
import { CronTime } from "cron";

export const testCronTime = (time: string) => {
  try {
    const p = new CronTime(time); // eslint-disable-line no-unused-vars
  } catch (e) {
    return false;
  }
  return true;
};

export const getCron = async ({ name }: { name: string }) => {
  const cronjob = await CronJobModel.findOne({ name });
  if (!cronjob) {
    return await CronJobModel.create({
      name,
      lastStartDate: undefined,
      lastErrorDate: undefined,
      lastError: undefined,
      lastSuccessDate: undefined,
      lastSuccessStartDate: undefined,
      running: false,
    });
  }
  return cronjob;
};

export const setCronStart = async ({
  name,
  startDate = new Date(),
  running = true,
}: {
  name: string;
  startDate?: Date;
  running?: boolean;
}) => {
  console.info(`[Cronjob][${name}] started: ${startDate}`);
  await CronJobModel.findOneAndUpdate(
    { name },
    { lastStartDate: startDate, running },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

export const setCronSuccess = async ({
  name,
  successDate = new Date(),
  successStartDate,
  running = false,
  data,
}: {
  name: string;
  successDate?: Date;
  successStartDate: Date;
  running?: boolean;
  data?: ICronJob["data"];
}) => {
  console.info(
    `[Cronjob][${name}] finished: ${successStartDate} - ${successDate}`
  );
  await CronJobModel.findOneAndUpdate(
    { name },
    {
      lastSuccessDate: successDate,
      lastSuccessStartDate: successStartDate,
      running,
      data,
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

export const setCronError = async ({
  name,
  errorDate = new Date(),
  running = false,
  error,
}: {
  name: string;
  errorDate?: Date;
  running?: boolean;
  error: any;
}) => {
  console.error(`[Cronjob][${name}] errored: ${error}`);
  await CronJobModel.findOneAndUpdate(
    { name },
    { lastErrorDate: errorDate, running, lastError: error },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

export const resetCronRunningState = async () =>
  CronJobModel.updateMany({}, { running: false });
