import { setCronStart, setCronSuccess, setCronError, mongoConnect } from '@democracy-deutschland/bundestagio-common';
import { CRON_NAME } from './config';
import { Period } from './types';
import { fetchDeputyDetails } from './scraper';
import { processDeputyList } from './processor';

const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });

  const period = parseInt(process.env.PERIOD ?? '20') as Period;

  // Allow testing a single deputy URL if provided via env variable
  const testDeputyUrl = process.env.TEST_DEPUTY_URL;
  if (testDeputyUrl) {
    console.log(`Testing single deputy URL: ${testDeputyUrl}`);
    const deputyData = await fetchDeputyDetails(testDeputyUrl);
    console.log('Deputy details:', deputyData);
  } else {
    await processDeputyList(period);
  }

  console.log('done 🥳');
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

const main = async () => {
  console.info('START');

  // Filter out dotenv config path from arguments
  const args = process.argv.filter((arg) => !arg.startsWith('dotenv_config_path='));
  const deputyUrl = args[2]; // Index 2 will be the first actual argument after node and script path

  if (deputyUrl && deputyUrl.includes('bundestag.de')) {
    console.log(`Fetching single deputy from URL: ${deputyUrl}`);
    const deputyData = await fetchDeputyDetails(deputyUrl);
    console.log('Deputy details:', JSON.stringify(deputyData, null, 2));
    process.exit(0);
    return;
  }

  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect(process.env.DB_URL);
  try {
    await start();
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
  }
  process.exit(0);
};

// Run main function directly in ES modules
main();
