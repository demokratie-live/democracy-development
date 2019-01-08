import * as fs from 'fs';
import * as util from 'util';

import { Scraper } from 'scapacra';

import { IProtocolScraperConfigurationOptions } from './config/ProtocolScraperConfiguration';
import { ProtocolSpeechScraperConfiguration } from './config/ProtocolSpeechScraperConfiguration';
import { ProtocolVotingScraperConfiguration } from './config/ProtocolVotingScraperConfiguration';
import { ProposedDecisionScraperConfiguration } from './config/ProposedDecisionScraperConfiguration';
import { DeputyProfileScraperConfiguration } from './config/DeputyProfileScraperConfiguration';

async function scrape() {
    let options: IProtocolScraperConfigurationOptions = {
        maxCount: 2
    };

    await Scraper.scrape([
        // new ProtocolSpeechScraperConfiguration(options),
        new ProtocolVotingScraperConfiguration(options),
        // new ProposedDecisionScraperConfiguration()
        // new DeputyProfileScraperConfiguration()
    ], ((dataPackages) => {
        console.log(util.inspect(dataPackages, false, null, true))
        for (const dataPackage of dataPackages) {
            let id = dataPackage.data.id;
            if (id == null) {
                id = dataPackage.data["top-id"];
            }

            fs.writeFileSync('out/scraperResult/deputies/' + id + '.json', JSON.stringify(dataPackage.data));
        }
    }));
}

scrape().then(c => { });