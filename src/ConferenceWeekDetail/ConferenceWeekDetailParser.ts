import { DataPackage, IParser } from '@democracy-deutschland/scapacra';
var moment = require('moment');

import { ConferenceWeekDetailsData, ConferenceWeekDetailsMeta } from './ConferenceWeekDetailBrowser';

export = Parser;

namespace Parser {
    type Session = {date: Date | null,
                    dateText: string | null,
                    session: string | null,
                    tops: Top[]}
    type Top = {    time: Date | null,
                    top: string | null,
                    heading: string | null,
                    article: string | null,
                    topic:  Topic[],
                    status: Status[]}
    type Topic = {  lines: string[],
                    documents: string[]}
    type Status = { line: string,
                    documents: string[]}

    export class ConferenceWeekDetailParser implements IParser<ConferenceWeekDetailsData,ConferenceWeekDetailsMeta>{
        public async parse(data: DataPackage<ConferenceWeekDetailsData,ConferenceWeekDetailsMeta>): Promise<DataPackage<Object,Object>> {
            const d = data.getData();
            const string: string = d ? d : '';

            let m;

            let lastYear: Number | null = null;
            let lastWeek: Number | null = null;
            let thisYear: Number | null = null;
            let thisWeek: Number | null = null;
            let nextYear: Number | null = null;
            let nextWeek: Number | null = null;
            let id: string = data.meta && data.meta.currentYear && data.meta.currentWeek ? `${data.meta.currentYear}_${data.meta.currentWeek}` : 'no_id';
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

            let sessions: Session[] = []
            const regex_DateSession = /<caption>[\s\S]*?<div class="bt-conference-title">([\s\S]*?)\((\d*)\. Sitzung\)<\/div>[\s\S]*?<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/gm;
            while ((m = regex_DateSession.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_DateSession.lastIndex) {
                    regex_DateSession.lastIndex++;
                }
                let session: Session = {date: null, dateText: null, session: null, tops: []};
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        session.dateText = match.trim();
                        session.date = moment.utc(session.dateText, 'DD MMM YYYY', 'de').toDate();

                        if(session.date){
                            thisYear = session.date.getFullYear();
                            thisWeek = moment(session.date).week();
                            if(thisWeek){
                                id = `${thisYear}_${thisWeek.toString().padStart(2,'0')}`
                            }
                        }
                    }
                    if (group === 2) {
                        session.session = match;
                    }
                    if (group === 3) {
                        const sessionData: string = match;
                        let n;
                        const regex_tops = /<tr>[\s\S]*?<td data-th="Uhrzeit"><p>([\s\S]*?)<\/p><\/td>[\s\S]*?<td data-th="TOP"><p>([\s\S]*?)<\/p><\/td>[\s\S]*?<td data-th="Thema">[\s\S]*?<div class="bt-documents-description">([\s\S]*?)<\/div>[\s\S]*?<\/td>[\s\S]*?<td data-th="Status\/ Abstimmung">([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gm
                        let lastTopTime: Date | null = null;
                        let newDay: Boolean = false;
                        while ((n = regex_tops.exec(sessionData)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (n.index === regex_tops.lastIndex) {
                                regex_tops.lastIndex++;
                            }
                            let top: Top = {time: null, top: null, heading: null, article: null, topic: [], status: []};
                            // The result can be accessed through the `m`-variable.
                            n.forEach((match, group) => {
                                if (group === 1) {
                                    top.time = moment.utc(`${session.dateText} ${match.trim()}`, 'DD MMM YYYY HH:mm', 'de').toDate();
                                    // Determin if the session is spanning into the new Day
                                    if (top.time && lastTopTime && lastTopTime.getUTCHours() > top.time.getUTCHours()) {
                                        newDay = true;
                                    }
                                    // If a new Day is detected just increase day by one for each following top
                                    if(top.time && newDay){
                                        top.time.setDate(top.time.getDate() + 1);
                                    }
                                    lastTopTime = top.time
                                }
                                if (group === 2) {
                                    top.top = match.trim();
                                }
                                if (group === 3) {
                                    let topic: string = match.trim();
                                    let o;

                                    const regex_topHeading = /<a href="#" class="bt-top-collapser collapser collapsed"[\s\S]*?>([\s\S]*?)<\/a>/gm
                                    while ((o = regex_topHeading.exec(topic)) !== null) {
                                        // This is necessary to avoid infinite loops with zero-width matches
                                        if (o.index === regex_topHeading.lastIndex) {
                                            regex_topHeading.lastIndex++;
                                        }
                                        // The result can be accessed through the `m`-variable.
                                        o.forEach((match, group) => {
                                            if (group === 1) {
                                                top.heading = match.trim();
                                            }
                                        })
                                    }

                                    const regex_article = /<button[\s\S]*?data-url="([\s\S]*?)">/gm
                                    while ((o = regex_article.exec(topic)) !== null) {
                                        // This is necessary to avoid infinite loops with zero-width matches
                                        if (o.index === regex_article.lastIndex) {
                                            regex_article.lastIndex++;
                                        }
                                        // The result can be accessed through the `m`-variable.
                                        o.forEach((match, group) => {
                                            if (group === 1) {
                                                top.article = `https://www.bundestag.de${match}`;
                                            }
                                        })
                                    }

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
                                    let topicPart: Topic = {lines: [], documents: []};

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
                                            if(line !== ""){
                                                topicPart.lines.push(line.trim());
                                            }
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
                                    let o;
                                    const regex_topTopic = /<p>([\s\S]*?)<\/p>/gm;
                                    while ((o = regex_topTopic.exec(statusText)) !== null) {
                                        // This is necessary to avoid infinite loops with zero-width matches
                                        if (o.index === regex_topTopic.lastIndex) {
                                            regex_topTopic.lastIndex++;
                                        }
                                        // The result can be accessed through the `m`-variable.
                                        o.forEach((match, group) => {
                                            if (group === 1) {
                                                statusText = match.trim();
                                            }
                                        })
                                    }
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
                                    top = {time: null, top: null, heading: null, article: null, topic: [], status: []};
                                }
                            });
                        }
                        sessions.push(session);
                        session = {date: null, dateText: null, session: null, tops: []};
                    }
                });
            }

            return new DataPackage<Object,Object>(
                {
                    id,
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
                data.getMeta()
            );
        }
    }
}