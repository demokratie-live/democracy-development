import { CronJob } from 'cron';

import CONFIG from '../../config';

import importProcedures from './../../importer/importProcedures';
import importConferenceWeekDetails from './../../importer/importConferenceWeekDetails';
import importNamedPolls from './../../importer/importNamedPolls';
import importNamedPollDeputies from './../../importer/importNamedPollDeputies';
import importDeputyProfiles from './../../importer/importDeputyProfiles';

const jobs = [];
const cronJobs = () => {
  // Procedures
  if (CONFIG.CRON_PROCEDURES) {
    jobs.push(
      new CronJob(
        CONFIG.CRON_PROCEDURES,
        importProcedures,
        null,
        true,
        'Europe/Berlin',
        null,
        CONFIG.CRON_START_ON_INIT,
      ),
    );
    Log.info('Cronjob "Procedures" registered');
  } else {
    Log.warn('Cronjob "Procedures" disabled');
  }

  // ConferenceWeekDetails
  if (CONFIG.CRON_CONFERENCEWEEKDETAILS) {
    jobs.push(
      new CronJob(
        CONFIG.CRON_CONFERENCEWEEKDETAILS,
        importConferenceWeekDetails,
        null,
        true,
        'Europe/Berlin',
        null,
        CONFIG.CRON_START_ON_INIT,
      ),
    );
    Log.info('Cronjob "ConferenceWeekDetails" registered');
  } else {
    Log.warn('Cronjob "ConferenceWeekDetails" disabled');
  }

  // Named Polls
  if (CONFIG.CRON_NAMED_POLLS) {
    jobs.push(
      new CronJob(
        CONFIG.CRON_NAMED_POLLS,
        importNamedPolls,
        null,
        true,
        'Europe/Berlin',
        null,
        CONFIG.CRON_START_ON_INIT,
      ),
    );
    Log.info('Cronjob "Named Polls" registered');
  } else {
    Log.warn('Cronjob "Named Polls" disabled');
  }

  // Named Polls Deputies
  if (CONFIG.CRON_NAMED_POLLS_DEPUTIES) {
    jobs.push(
      new CronJob(
        CONFIG.CRON_NAMED_POLLS_DEPUTIES,
        importNamedPollDeputies,
        null,
        true,
        'Europe/Berlin',
        null,
        CONFIG.CRON_START_ON_INIT,
      ),
    );
    Log.info('Cronjob "Named Polls Deputies" registered');
  } else {
    Log.warn('Cronjob "Named Polls Deputies" disabled');
  }

  // Deputy Profiles
  if (CONFIG.CRON_DEPUTY_PROFILES) {
    jobs.push(
      new CronJob(
        CONFIG.CRON_DEPUTY_PROFILES,
        importDeputyProfiles,
        null,
        true,
        'Europe/Berlin',
        null,
        CONFIG.CRON_START_ON_INIT,
      ),
    );
    Log.info('Cronjob "Deputy Profiles" registered');
  } else {
    Log.warn('Cronjob "Deputy Profiles" disabled');
  }

  // Return
  return jobs;
};

module.exports = cronJobs;
