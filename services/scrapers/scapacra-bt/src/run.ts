import * as fs from 'fs';
import { Scraper, IScraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputyScraper, ConferenceWeekDetailScraper } from './';

enum AvailableScrapers {
  NamedPollDeputyScraper = 'NamedPollDeputy',
  ConferenceWeekDetailScraper = 'ConferenceWeekDetail',
}

async function scrape(dataset: string, out: string = './out'): Promise<void> {
  let scraper: IScraper<unknown, unknown> | null = null;

  switch (dataset) {
    case AvailableScrapers.NamedPollDeputyScraper:
      scraper = new NamedPollDeputyScraper();
      break;
    case AvailableScrapers.ConferenceWeekDetailScraper:
      scraper = new ConferenceWeekDetailScraper();
      break;
    default:
      console.log('Please select a valid option as dataset:');
      console.log(AvailableScrapers);
      break;
  }

  if (scraper) {
    await Scraper.scrape(scraper, async (dataPackage) => {
      if (!dataPackage) {
        console.log('Error: Got empty DataPackage');
      } else {
        let id = dataPackage.data ? (dataPackage.data as { id: string }).id : 'no_id';
        fs.writeFileSync(`${out}/${id}.json`, JSON.stringify(dataPackage, null, 2));
        console.log(`Found ${id} - ${out}/${id}.json`);
      }
    });
    console.log(`Finished: ${dataset}`);
  }
}

// Remove the unused variable in the promise chain
scrape(process.argv[2], process.argv[3]).catch((error) => console.error(error));
