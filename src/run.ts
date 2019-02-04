import * as fs from 'fs';
import * as util from 'util';

import { Scraper } from '@democracy-deutschland/scapacra';

import {
    IProtocolScraperConfigurationOptions,
    ProtocolSpeechScraperConfiguration,
    ProtocolVotingScraperConfiguration,
    ProposedDecisionScraperConfiguration,
    DeputyProfileScraperConfiguration,
    NamedPollScraperConfiguration
} from './';

async function scrape() {
    let options: IProtocolScraperConfigurationOptions = {
        maxCount: 2
    };

    await Scraper.scrape([
        // new ProtocolSpeechScraperConfiguration(options),
        // new ProtocolVotingScraperConfiguration(options),
        // new ProposedDecisionScraperConfiguration()
        // new DeputyProfileScraperConfiguration()
        new NamedPollScraperConfiguration()
    ], ((dataPackages) => {
        console.log(util.inspect(dataPackages, false, null, true))
        for (const dataPackage of dataPackages) {
            let id = dataPackage.data.id;
            const file_id = `${dataPackage.data.id}_${dataPackage.data.name}`.replace(/(\.|\/| |,)/g, '_');
            fs.writeFileSync('out/scraperResult/namedPolls/' + file_id + '.json', JSON.stringify(dataPackage));
        }
    }));
}

scrape().then(c => { });