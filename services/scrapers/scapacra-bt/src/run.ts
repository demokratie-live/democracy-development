import * as fs from 'fs';
import * as util from 'util';

import { Scraper } from 'scapacra';

import {
    IProtocolScraperConfigurationOptions,
    ProtocolSpeechScraperConfiguration,
    ProtocolVotingScraperConfiguration,
    ProposedDecisionScraperConfiguration,
    DeputyProfileScraperConfiguration
} from './';

async function scrape() {
    let options: IProtocolScraperConfigurationOptions = {
        maxCount: 2
    };

    await Scraper.scrape([
        // new ProtocolSpeechScraperConfiguration(options),
        // new ProtocolVotingScraperConfiguration(options),
        // new ProposedDecisionScraperConfiguration()
        new DeputyProfileScraperConfiguration()
    ], ((dataPackages) => {
        console.log(util.inspect(dataPackages, false, null, true))
        for (const dataPackage of dataPackages) {
            let id = dataPackage.data.id;
            if (id == null) {
                id = dataPackage.data["top-id"];
            }

            const file_id = `${dataPackage.data.id}_${dataPackage.data.name}`.replace(/(\.|\/| |,)/g, '_');
            fs.writeFileSync('out/scraperResult/deputies/' + file_id + '.json', JSON.stringify(dataPackage));
        }
    }));
}

scrape().then(c => { });