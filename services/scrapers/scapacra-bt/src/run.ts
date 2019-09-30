import * as fs from 'fs';

import { Scraper, IScraper } from '@democracy-deutschland/scapacra';

import {
    DeputyProfileScraper,
    NamedPollScraper,
    NamedPollDeputyScraper,
    ConferenceWeekDetailScraper
} from './';

enum AvailableScrapers {
    DeputyProfile = 'DeputyProfile',
    NamedPollScraper = 'NamedPoll',
    NamedPollDeputyScraper = 'NamedPollDeputy',
    ConferenceWeekDetailScraper = 'ConferenceWeekDetail'
}

async function scrape(dataset: String,out: String = './out') {

    let scraper: IScraper<any> | null = null;
    switch(dataset){
        case AvailableScrapers.DeputyProfile:
            scraper = new DeputyProfileScraper();
            break;
        case AvailableScrapers.NamedPollScraper:
            scraper = new NamedPollScraper();
            break;
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
    if(scraper){
        await Scraper.scrape([scraper], ((dataPackages) => {
            for (const dataPackage of dataPackages) {
                let id = dataPackage.data.id;
                fs.writeFileSync(`${out}/${id}.json`, JSON.stringify(dataPackage, null, 2));
                console.log(`Found ${id} - ${out}/${id}.json`)
            }
        }))
        console.log(`Finished: ${dataset}`)
    };
}

scrape(process.argv[2],process.argv[3]).then(c => { });