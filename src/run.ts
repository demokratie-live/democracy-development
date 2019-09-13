import * as fs from 'fs';

import { Scraper,IScraperConfiguration } from '@democracy-deutschland/scapacra';

import {
    DeputyProfileScraper,
    NamedPollScraper,
    NamedPollDeputyScraper
} from './';

enum AvailableScrapers {
    DeputyProfile = 'DeputyProfile',
    NamedPollScraper = 'NamedPoll',
    NamedPollDeputyScraper = 'NamedPollDeputy',
}

async function scrape(dataset: String,out: String = './out') {

    let scraper: IScraperConfiguration<any> | null = null;
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
    };
}

scrape(process.argv[2],process.argv[3]).then(c => { });