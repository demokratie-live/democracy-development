import * as fs from 'fs';

import { IProtocolScraperConfigurationOptions } from '../src/config/ProtocolScraperConfiguration';
import { ProtocolSpeechScraperConfiguration } from '../src/config/ProtocolSpeechScraperConfiguration';
import { ProtocolVotingScraperConfiguration } from '../src/config/ProtocolVotingScraperConfiguration';
import { ProposedDecisionScraperConfiguration } from '../src/config/ProposedDecisionScraperConfiguration';

import { Scraper } from '../src/importer/Importer';

async function scrape() {
    let options: IProtocolScraperConfigurationOptions = {
        maxCount: 2
    };

    await Scraper.scrape([
        new ProtocolSpeechScraperConfiguration(options),
        new ProtocolVotingScraperConfiguration(options),
        //new ProposedDecisionScraperConfiguration()
    ], (jsons => {
        for (const json of jsons) {
            let id = json.id;
            if (id == null) {
                id = json["top-id"];
            } 

            fs.writeFileSync('out/scraperResult/' + id + '.json', JSON.stringify(json));
        }
    }));
}

scrape().then(c => { });