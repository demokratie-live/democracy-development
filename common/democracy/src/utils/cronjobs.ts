import { CronTime } from "cron";
import { ICronJob, CronJobModel } from "../models";

export const testCronTime = (time?: string) => {
  if (!time) {
    return false;
  }
  try {
    new CronTime(time);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

export const getCron = async ({
  name,
}: {
  name: string;
}): Promise<Partial<ICronJob>> => {
  const cronjob = await CronJobModel.findOne({ name });
  if (!cronjob) {
    return {
      name,
      lastStartDate: undefined,
      lastErrorDate: undefined,
      lastError: undefined,
      lastSuccessDate: undefined,
      lastSuccessStartDate: undefined,
      running: false,
    };
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
}: {
  name: string;
  successDate?: Date;
  successStartDate: Date;
  running?: boolean;
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
  error?: string;
}) => {
  console.error(`[Cronjob][${name}] errored: ${error}`);
  await CronJobModel.findOneAndUpdate(
    { name },
    { lastErrorDate: errorDate, running, lastError: error },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

export const resetCronSuccessStartDate = async () => {
  const CRON_NAME = "SheduleBioResync";
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  await CronJobModel.updateMany({}, { lastSuccessStartDate: new Date(0) });
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

export const resetCronRunningState = async () =>
  CronJobModel.updateMany({}, { running: false });
