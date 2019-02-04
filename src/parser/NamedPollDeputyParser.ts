import { IDataPackage, IParser } from '@democracy-deutschland/scapacra';
var moment = require('moment');

import { NamedPollDeputies } from '../browser/NamedPollDeputyBrowser';

export = NamedPollDeputy_Parser;

namespace NamedPollDeputy_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class NamedPollDeputyParser implements IParser<NamedPollDeputies>{
        private async readStream(stream: NodeJS.ReadableStream): Promise<string> {
            return new Promise((resolve) => {
                let string: string = '';
                stream.on('data', function (buffer) {
                    string += buffer.toString();
                }).on('end', () => {
                    resolve(string);
                });
            });
        }
        public async parse(data: IDataPackage<NamedPollDeputies>): Promise<IDataPackage<any>[]> {
            const stream = data.data.openStream();

            const string = await this.readStream(stream);
            const base_url: string = 'https://www.bundestag.de'

            let m;

            //id
            let id: string | null = null;
            if (data.metadata.url) {
                const regex_id = /id=(.*)/gm;
                while ((m = regex_id.exec(data.metadata.url)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_id.lastIndex) {
                        regex_id.lastIndex++;
                    }
                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            id = match
                        }
                    });
                }
            }

            let membersVoted: string = '';
            const regex_membersVoted = /<h3> (.*?) Mitglieder<\/h3>/gm;
            while ((m = regex_membersVoted.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_membersVoted.lastIndex) {
                    regex_membersVoted.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        membersVoted = match;
                    }
                });
            }

            let resultAll: any = { yes: null, no: null, abstain: null, na: null };// TODO Typescript
            const regex_ResultAll = /<ul class="bt-chart-legend">[\s\S]*?<li class="bt-legend-ja"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-nein"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-enthalten"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-na"><span>(.*?)<\/span>/gm;
            while ((m = regex_ResultAll.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_ResultAll.lastIndex) {
                    regex_ResultAll.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        resultAll.yes = match;
                    }
                    if (group === 2) {
                        resultAll.no = match;
                    }
                    if (group === 3) {
                        resultAll.abstain = match;
                    }
                    if (group === 4) {
                        resultAll.na = match;
                    }
                });
            }

            let deputies: any = [];
            const regex_deputySel = /<div class="bt-slide-content">([\s\S]*?)<\/a>[\s\S]*?<\/div>[\s\S]*?<\/div>/gm;
            const regex_deputy = /<a href="(.*?)\?subview=na"[\s\S]*?<img[\s\S]*?data-img-md-normal="(.*?)"[\s\S]*?<div class="bt-teaser-person-text" data-bundesland="(.*?)"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<p class="bt-person-fraktion">(.*?)<\/p>[\s\S]*?<p class="bt-person-abstimmung bt-abstimmung-(.*?)">(.*?)<\/p>/gm;
            while ((m = regex_deputySel.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_deputySel.lastIndex) {
                    regex_deputySel.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 0) { //full match
                        let deputy: {
                            URL: string | null, imgURL: string | null, state: string | null, name: string | null, party: string | null, vote: string | null
                        } = { URL: null, imgURL: null, state: null, name: null, party: null, vote: null };
                        while ((m = regex_deputy.exec(match)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex_deputy.lastIndex) {
                                regex_deputy.lastIndex++;
                            }
                            // The result can be accessed through the `m`-variable.
                            m.forEach((match2, group2) => {
                                if (group2 === 1) {
                                    deputy.URL = match2 ? base_url + match2 : null;
                                }
                                if (group2 === 2) {
                                    deputy.imgURL = match2 ? base_url + match2 : null;
                                }
                                if (group2 === 3) {
                                    deputy.state = match2;
                                }
                                if (group2 === 4) {
                                    deputy.name = match2;
                                }
                                if (group2 === 5) {
                                    deputy.party = match2;
                                }
                                if (group2 === 6) {
                                    deputy.vote = match2;
                                    deputies.push(deputy);
                                }
                            });
                        }
                    }
                });

            }

            return [{
                metadata: data.metadata,
                data: { id, membersVoted, resultAll, deputies }
            }];
        }
    }
}