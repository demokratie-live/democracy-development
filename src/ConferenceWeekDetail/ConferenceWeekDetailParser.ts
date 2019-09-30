import { IDataPackage, IParser } from '@democracy-deutschland/scapacra';
var moment = require('moment');

import { ConferenceWeekDetails } from './ConferenceWeekDetailBrowser';
import { exists } from 'fs';

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

            let sessions: {date: Date | null, dateText: string | null, session: string | null, tops: {time: Date | null, top: string | null, topic: { lines: string[], documents: string[]}[], status: {line: string, documents: string[]}[]}[]}[] = []
            const regex_DateSession = /<caption>[\s\S]*?<div class="bt-conference-title">([\s\S]*?)\((\d*)\. Sitzung\)<\/div>[\s\S]*?<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/gm;
            while ((m = regex_DateSession.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_DateSession.lastIndex) {
                    regex_DateSession.lastIndex++;
                }
                let session: {date: Date | null, dateText: string | null, session: string | null, tops: {time: Date | null, top: string | null, topic: { lines: string[], documents: string[]}[], status: {line: string, documents: string[]}[]}[]} = {date: null, dateText: null, session: null, tops: []};
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        session.dateText = match.trim();
                        session.date = moment.utc(session.dateText, 'DD MMM YYYY', 'de').toDate();
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
                            let top: {time: Date | null, top: string | null, topic: { lines: string[], documents: string[]}[], status: {line: string, documents: string[]}[]} = {time: null, top: null, topic: [], status: []};
                            // The result can be accessed through the `m`-variable.
                            n.forEach((match, group) => {
                                if (group === 1) {
                                    top.time = moment.utc(`${session.dateText} ${match.trim()}`, 'DD MMM YYYY HH:mm', 'de').toDate();
                                }
                                if (group === 2) {
                                    top.top = match.trim();
                                }
                                if (group === 3) {
                                    let topic: string = match.trim();
                                    let o;
                                    const regex_topTopic = /<p>([\s\S]*?)<\/p>/gm;
                                    while ((o = regex_topTopic.exec(topic)) !== null) {
                                        // This is necessary to avoid infinite loops with zero-width matches
                                        if (o.index === regex_topTopic.lastIndex) {
                                            regex_topTopic.lastIndex++;
                                        }
                                        // The result can be accessed through the `m`-variable.
                                        o.forEach((match, group) => {
                                            if (group === 1) {
                                                topic = match.trim();
                                            }
                                        })
                                    }
                                    let topicLines = topic.split('<br/>');
                                    let topicPart: { lines: string[], documents: string[]} = {lines: [], documents: []};
                                    const regex_newTopicPart = /^(ZP )?(\d{1,2})?\.?\S?\)/gm;
                                    topicLines.forEach(line => {
                                        if( topicPart.lines.length !== 0 &&
                                            (   line === "" ||
                                                line.match(regex_newTopicPart) !== null)){
                                            top.topic.push(topicPart);
                                            topicPart = {lines: [], documents: []};
                                            if(line !== ""){
                                                topicPart.lines.push(line.trim());
                                            }
                                        } else {
                                            topicPart.lines.push(line.trim());
                                        }

                                        let p;
                                        const regex_documents = /href="([\s\S]*?)"/gm
                                        while ((p = regex_documents.exec(line)) !== null) {
                                            // This is necessary to avoid infinite loops with zero-width matches
                                            if (p.index === regex_documents.lastIndex) {
                                                regex_documents.lastIndex++;
                                            }
                                            // The result can be accessed through the `m`-variable.
                                            p.forEach((match, group) => {
                                                if (group === 1) {
                                                    topicPart.documents.push(match);
                                                }
                                            })
                                        }
                                    });
                                    if(topicPart.lines.length > 0){
                                        top.topic.push(topicPart);
                                    }
                                }
                                if (group === 4) {
                                    let statusText = match.trim();
                                    let stati = statusText.split('<br />');
                                    stati.forEach(line => {
                                        if(line !== ""){
                                            let status: {line: string, documents: string[]} = {line, documents: []};
                                            let q;
                                            const regex_documents = /href="([\s\S]*?)"/gm
                                            while ((q = regex_documents.exec(line)) !== null) {
                                                // This is necessary to avoid infinite loops with zero-width matches
                                                if (q.index === regex_documents.lastIndex) {
                                                    regex_documents.lastIndex++;
                                                }
                                                // The result can be accessed through the `m`-variable.
                                                q.forEach((match, group) => {
                                                    if (group === 1) {
                                                        status.documents.push(match);
                                                    }
                                                })
                                            }
                                            top.status.push(status);
                                        }
                                    })
                                    session.tops.push(top);
                                    top = {time: null, top: null, topic: [], status: []};
                                }
                            });
                        }
                        sessions.push(session);
                        session = {date: null, dateText: null, session: null, tops: []};
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