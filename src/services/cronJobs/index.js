import { CronJob } from 'cron';

import importProcedures from './../../importer/importProcedures';
import importAgenda from './../../importer/importAgenda';
import importNamedPolls from './../../importer/importNamedPolls';
import importNamedPollDeputies from './../../importer/importNamedPollDeputies';
import importDeputyProfiles from './../../importer/importDeputyProfiles';

const cronJobs = () => [
  new CronJob('15 * * * *', importProcedures, null, true, 'Europe/Berlin', null, true),
  new CronJob('*/15 * * * *', importAgenda, null, true, 'Europe/Berlin', null, true),
  new CronJob('0 * * * *', importNamedPolls, null, true, 'Europe/Berlin', null, true),
  new CronJob('15 * * * *', importNamedPollDeputies, null, true, 'Europe/Berlin', null, true),
  new CronJob('30 * * * *', importDeputyProfiles, null, true, 'Europe/Berlin', null, true),
];

module.exports = cronJobs;
