import { IDataPackage, IParser } from '@democracy-deutschland/scapacra';
var moment = require('moment');

import { ConferenceWeekDetails } from './ConferenceWeekDetailBrowser';

export = Parser;

namespace Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ConferenceWeekDetailParser implements IParser<ConferenceWeekDetails>{
        private async readStream(stream: NodeJS.ReadableStream): Promise<string> {
            return new Promise((resolve) => {
                let string: string = '';
                stream.setEncoding('utf8');
                stream.on('data', function (buffer: String) {
                    string += buffer;
                }).on('end', () => {
                    resolve(string);
                });
            });
        }
        public async parse(data: IDataPackage<ConferenceWeekDetails>): Promise<IDataPackage<any>[]> {
            const string: string = <string>(<unknown> data.data.openStream());
            
            let thisYear: Number | null = null;
            let thisWeek: Number | null = null;
            if(data.metadata.description){
                thisYear = parseInt(data.metadata.description.split('_')[0]);
                thisWeek = parseInt(data.metadata.description.split('_')[1]);
            }
                

            let m;

            let lastYear: Number | null = null;
            let lastWeek: Number | null = null;
            let nextYear: Number | null = null;
            let nextWeek: Number | null = null;
            const regex_YearsWeeks = /data-previousyear="(\d*)" data-previousweeknumber="(\d*)" data-nextyear="(\d*)" data-nextweeknumber="(\d*)"/gm
            while ((m = regex_YearsWeeks.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_YearsWeeks.lastIndex) {
                    regex_YearsWeeks.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        lastYear = parseInt(match, 10) || null;
                    }
                    if (group === 2) {
                        lastWeek = parseInt(match, 10) || null;
                    }
                    if (group === 3) {
                        nextYear = parseInt(match, 10) || null;
                    }
                    if (group === 4) {
                        nextWeek = parseInt(match, 10) || null;
                    }
                });
            }

            let sessions: {date: string | null, session: string | null, tops: {time: string | null, top: string | null, topic: string | null, status: string | null}[]}[] = []
            const regex_DateSession = /<caption>[\s\S]*?<div class="bt-conference-title">([\s\S]*?)\((\d*)\. Sitzung\)<\/div>[\s\S]*?<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/gm;
            while ((m = regex_DateSession.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_DateSession.lastIndex) {
                    regex_DateSession.lastIndex++;
                }
                let session: {date: string | null, session: string | null, tops: {time: string | null, top: string | null, topic: string | null, status: string | null}[]} = {date: null, session: null, tops: []};
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        session.date = match;
                    }
                    if (group === 2) {
                        session.session = match;
                    }
                    if (group === 3) {
                        const sessionData: string = match;
                        let n;
                        const regex_tops = /<tr>[\s\S]*?<td data-th="Uhrzeit"><p>([\s\S]*?)<\/p><\/td>[\s\S]*?<td data-th="TOP"><p>([\s\S]*?)<\/p><\/td>[\s\S]*?<td data-th="Thema">[\s\S]*?<div class="bt-documents-description">([\s\S]*?)<\/div>[\s\S]*?<\/td>[\s\S]*?<td data-th="Status\/ Abstimmung">[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/td>[\s\S]*?<\/tr>/gm
                        while ((n = regex_tops.exec(sessionData)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (n.index === regex_tops.lastIndex) {
                                regex_tops.lastIndex++;
                            }
                            let top: {time: string | null, top: string | null, topic: string | null, status: string | null} = {time: null, top: null, topic: null, status: null};
                            // The result can be accessed through the `m`-variable.
                            n.forEach((match, group) => {
                                if (group === 1) {
                                    top.time = match.trim();
                                }
                                if (group === 2) {
                                    top.top = match.trim();
                                }
                                if (group === 3) {
                                    top.topic = match.trim();
                                    let o;
                                    const regex_topTopic = /<p>([\s\S]*?)<\/p>/gm;
                                    while ((o = regex_topTopic.exec(match.trim())) !== null) {
                                        // This is necessary to avoid infinite loops with zero-width matches
                                        if (o.index === regex_topTopic.lastIndex) {
                                            regex_topTopic.lastIndex++;
                                        }
                                        // The result can be accessed through the `m`-variable.
                                        o.forEach((match, group) => {
                                            if (group === 1) {
                                                top.topic = match.trim();
                                            }
                                        })
                                    }
                                }
                                if (group === 4) {
                                    top.status = match.trim();
                                    session.tops.push(top);
                                    top = {time: null, top: null, topic: null, status: null};
                                }
                            });
                        }
                        sessions.push(session);
                        session = {date: null, session: null, tops: []};
                    }
                });
            }

            return [{
                metadata: data.metadata,
                data: {
                    id: data.metadata.description,
                    previous: {
                        year: lastYear,
                        week: lastWeek,
                    },
                    this: {
                        year: thisYear,
                        week: thisWeek,
                    },
                    next: {
                        year: nextYear,
                        week: nextWeek,
                    },
                    sessions
                },
            }];
        }
    }
}