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
        // new ProtocolVotingScraperConfiguration(options),
        // new ProposedDecisionScraperConfiguration()
        new DeputyProfileScraperConfiguration()
    ], ((jsons: any) => {
        console.log(util.inspect(jsons, false, null, true))
        for (const json of jsons) {
            let id = json.id;
            if (id == null) {
                id = json["top-id"];
            }

            fs.writeFileSync('out/scraperResult/deputies/' + id + '.json', JSON.stringify(json));
        }
    }));
}

scrape().then(c => { });