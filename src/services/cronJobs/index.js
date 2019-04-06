import { CronJob } from 'cron';

import CONFIG from '../../config';

import importProcedures from './../../importer/importProcedures';
import importAgenda from './../../importer/importAgenda';
import importNamedPolls from './../../importer/importNamedPolls';
import importNamedPollDeputies from './../../importer/importNamedPollDeputies';
import importDeputyProfiles from './../../importer/importDeputyProfiles';

const jobs = [];
if (CONFIG.CRON_PROCEDURES)
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
if (CONFIG.CRON_AGENDA)
  jobs.push(
    new CronJob(
      CONFIG.CRON_AGENDA,
      importAgenda,
      null,
      true,
      'Europe/Berlin',
      null,
      CONFIG.CRON_START_ON_INIT,
    ),
  );
if (CONFIG.CRON_NAMED_POLLS)
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
if (CONFIG.CRON_NAMED_POLLS_DEPUTIES)
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
if (CONFIG.CRON_DEPUTY_PROFILES)
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

const cronJobs = () => jobs;

module.exports = cronJobs;
