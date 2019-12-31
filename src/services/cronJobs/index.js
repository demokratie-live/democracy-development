import { CronJob } from 'cron';

import CONFIG from '../../config';

import importProcedures, {CRON_NAME as CRON_NAME_PROCEDURES} from './../../importer/importProcedures';
import importConferenceWeekDetails, {CRON_NAME as CRON_NAME_CONFERENCE_WEEK_DETAILS} from './../../importer/importConferenceWeekDetails';
import importNamedPolls, {CRON_NAME as CRON_NAME_NAMED_POLLS} from './../../importer/importNamedPolls';
import importNamedPollDeputies, {CRON_NAME as CRON_NAME_NAMED_POLLS_DEPUTIES} from './../../importer/importNamedPollDeputies';
import importDeputyProfiles, {CRON_NAME as CRON_NAME_DEPUTY_PROFILES} from './../../importer/importDeputyProfiles';

import { resetCronRunningState } from './tools';

// global variable to store cronjobs
const jobs = [];

const registerCronJob = (name, cronTime, cronTask, startOnInit) => {
  if (cronTime) {
    jobs.push(new CronJob(cronTime, cronTask, null, true, 'Europe/Berlin', null, startOnInit));
    Log.info(`[Cronjob][${name}] registered: ${cronTime}`);
  } else {
    Log.warn(`[Cronjob][${name}] disabled`);
  }
};

const cronJobs = async () => {
  // Server freshly started -> Reset all cron states
  // This assumes that only one instance is running on the same database
  await resetCronRunningState();
  // Procedures
  registerCronJob(
    CRON_NAME_PROCEDURES,
    CONFIG.CRON_PROCEDURES,
    importProcedures,
    CONFIG.CRON_START_ON_INIT,
  );
  // ConferenceWeekDetails
  registerCronJob(
    CRON_NAME_CONFERENCE_WEEK_DETAILS,
    CONFIG.CRON_CONFERENCEWEEKDETAILS,
    importConferenceWeekDetails,
    CONFIG.CRON_START_ON_INIT,
  );
  // NamedPolls
  registerCronJob(
    CRON_NAME_NAMED_POLLS,
    CONFIG.CRON_NAMED_POLLS,
    importNamedPolls,
    CONFIG.CRON_START_ON_INIT,
  );
  // NamedPollsDeputies
  registerCronJob(
    CRON_NAME_NAMED_POLLS_DEPUTIES,
    CONFIG.CRON_NAMED_POLLS_DEPUTIES,
    importNamedPollDeputies,
    CONFIG.CRON_START_ON_INIT,
  );
  // DeputyProfiles
  registerCronJob(
    CRON_NAME_DEPUTY_PROFILES,
    CONFIG.CRON_DEPUTY_PROFILES,
    importDeputyProfiles,
    CONFIG.CRON_START_ON_INIT,
  );
  // Return
  return jobs;
};

module.exports = cronJobs;
