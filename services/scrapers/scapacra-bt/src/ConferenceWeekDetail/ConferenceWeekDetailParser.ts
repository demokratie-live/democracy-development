import { DataPackage, IParser } from '@democracy-deutschland/scapacra';
import moment from 'moment';

import { ConferenceWeekDetailsData, ConferenceWeekDetailsMeta } from './ConferenceWeekDetailBrowser';

type Session = {
  date: Date | null;
  dateText: string | null;
  session: string | null;
  tops: Top[];
};
type Top = {
  time: Date | null;
  top: string | null;
  heading: string | null;
  article: string | null;
  topic: Topic[];
  status: Status[];
};
type Topic = { lines: string[]; documents: string[] };
type Status = { line: string; documents: string[] };

export class ConferenceWeekDetailParser implements IParser<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta> {
  public async parse(
    data: DataPackage<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta>,
  ): Promise<DataPackage<object, object>> {
    const string = data.getData() || '';
    const { lastYear, lastWeek, nextYear, nextWeek } = this.parseYearsAndWeeks(string);
    const sessions = this.parseSessions(string);
    const { thisYear, thisWeek } = this.getThisYearAndWeek(sessions);

    const id = this.generateId(data, thisYear, thisWeek);

    return new DataPackage<object, object>(
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
        sessions,
      },
      data.getMeta(),
    );
  }

  private generateId(
    data: DataPackage<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta>,
    thisYear: number | null,
    thisWeek: number | null,
  ): string {
    if (data.meta?.currentYear && data.meta?.currentWeek) {
      return `${data.meta.currentYear}_${data.meta.currentWeek}`;
    }
    if (thisYear && thisWeek) {
      return `${thisYear}_${thisWeek.toString().padStart(2, '0')}`;
    }
    return 'no_id';
  }

  private parseYearsAndWeeks(string: string): {
    lastYear: number | null;
    lastWeek: number | null;
    nextYear: number | null;
    nextWeek: number | null;
  } {
    let lastYear: number | null = null;
    let lastWeek: number | null = null;
    let nextYear: number | null = null;
    let nextWeek: number | null = null;

    const regex_YearsWeeks =
      /data-previousyear="(\d*)" data-previousweeknumber="(\d*)" data-nextyear="(\d*)" data-nextweeknumber="(\d*)"/gm;
    let m;
    while ((m = regex_YearsWeeks.exec(string)) !== null) {
      if (m.index === regex_YearsWeeks.lastIndex) {
        regex_YearsWeeks.lastIndex++;
      }
      lastYear = parseInt(m[1], 10) || null;
      lastWeek = parseInt(m[2], 10) || null;
      nextYear = parseInt(m[3], 10) || null;
      nextWeek = parseInt(m[4], 10) || null;
    }

    return { lastYear, lastWeek, nextYear, nextWeek };
  }

  private getThisYearAndWeek(sessions: Session[]): { thisYear: number | null; thisWeek: number | null } {
    if (sessions.length === 0 || !sessions[0].date) {
      return { thisYear: null, thisWeek: null };
    }

    const firstSessionDate = sessions[0].date;
    const thisYear = firstSessionDate.getFullYear();
    const thisWeek = moment(firstSessionDate).week();

    return { thisYear, thisWeek };
  }

  private parseSessions(string: string): Session[] {
    const sessions: Session[] = [];
    const regex_DateSession =
      /<caption>[^]*?<div class="bt-conference-title"[^>]*?>([^(]*?)\((\d+)\. Sitzung\)<\/div>[^]*?<\/caption>[^]*?<tbody>([^]*?)<\/tbody>/gm;

    let m;
    while ((m = regex_DateSession.exec(string)) !== null) {
      if (m.index === regex_DateSession.lastIndex) {
        regex_DateSession.lastIndex++;
      }

      const session = this.parseSession(m[1], m[2], m[3]);
      sessions.push(session);
    }

    return sessions;
  }

  private parseSession(dateText: string, sessionNumber: string, sessionData: string): Session {
    const session: Session = {
      date: null,
      dateText: null,
      session: sessionNumber,
      tops: [],
    };

    session.dateText = dateText.trim();
    session.date = moment.utc(session.dateText, 'DD MMM YYYY', 'de').toDate();
    session.tops = this.parseTops(sessionData, session.dateText);

    return session;
  }

  private parseTops(sessionData: string, sessionDateText: string): Top[] {
    const tops: Top[] = [];
    const regex_tops =
      /<tr>\s*<td data-th="Uhrzeit">\s*<p>([^<]+)<\/p>\s*<\/td>\s*<td data-th="TOP">\s*<p>([^<]+)<\/p>\s*<\/td>\s*<td data-th="Thema">\s*<div class="bt-documents-description">([^]*?)<\/div>\s*<\/td>\s*<td data-th="Status\/ Abstimmung">\s*([^]*?)\s*<\/td>\s*<\/tr>/gm;

    let lastTopTime: Date | null = null;
    let newDay = false;
    let n;

    while ((n = regex_tops.exec(sessionData)) !== null) {
      if (n.index === regex_tops.lastIndex) {
        regex_tops.lastIndex++;
      }

      const top = this.parseTop(n[1], n[2], n[3], n[4], sessionDateText);

      if (top.time && lastTopTime) {
        const currentHour = top.time.getUTCHours();
        const lastHour = lastTopTime.getUTCHours();

        // Tageswechsel erkennen: Wenn aktuelle Stunde kleiner ist als letzte Stunde
        // und der Unterschied größer als 6 Stunden ist (um Mitternacht zu erkennen)
        if (currentHour < lastHour && lastHour - currentHour > 6) {
          newDay = true;
        }
      }

      if (newDay && top.time) {
        const nextDay = new Date(top.time);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        top.time = nextDay;
      }

      lastTopTime = top.time;
      tops.push(top);
    }

    return tops;
  }

  private parseTop(timeStr: string, topStr: string, topicStr: string, statusStr: string, sessionDateText: string): Top {
    const top: Top = {
      time: null,
      top: topStr.trim(),
      heading: null,
      article: null,
      topic: [],
      status: [],
    };

    top.time = moment.utc(`${sessionDateText} ${timeStr.trim()}`, 'DD MMM YYYY HH:mm', 'de').toDate();

    this.parseTopicData(topicStr.trim(), top);
    this.parseStatusData(statusStr.trim(), top);

    return top;
  }

  private parseTopicData(topic: string, top: Top): void {
    const headingMatch = /<a href="#" class="bt-top-collapser collapser collapsed">([^<]+)<\/a>/g.exec(topic);
    if (headingMatch) {
      top.heading = headingMatch[1].trim();
    }

    const articleMatch = /<button[^>]*?data-url="([^"]+)">/gm.exec(topic);
    if (articleMatch) {
      top.article = articleMatch[1].startsWith('http') ? articleMatch[1] : `https://www.bundestag.de${articleMatch[1]}`;
    }

    const topicContent = this.extractTopicContent(topic);
    top.topic = this.parseTopicParts(topicContent);
  }

  private extractTopicContent(topic: string): string {
    const contentMatch = /<p>([^<]*(?:<(?!\/p>)[^<]*)*?)<\/p>/i.exec(topic);
    return contentMatch ? contentMatch[1].trim() : topic;
  }

  private parseTopicParts(topicContent: string): Topic[] {
    const topicLines = topicContent.split('<br/>');
    const topics: Topic[] = [];
    let currentTopic: Topic = { lines: [], documents: [] };
    const regex_newTopicPart = /^(?:ZP )?(?:\d{1,2})?\.?\S?\)/;

    topicLines.forEach((line) => {
      if (line === '') return;

      if (currentTopic.lines.length !== 0 && line.match(regex_newTopicPart)) {
        topics.push(currentTopic);
        currentTopic = { lines: [], documents: [] };
      }

      currentTopic.lines.push(line.trim());
      currentTopic.documents = [...currentTopic.documents, ...this.extractDocuments(line)];
    });

    if (currentTopic.lines.length > 0) {
      topics.push(currentTopic);
    }

    return topics;
  }

  private parseStatusData(statusText: string, top: Top): void {
    const cleanedStatus = this.extractStatusContent(statusText);
    const stati = cleanedStatus
      .split(/<br\s*\/?>/i)
      .map((line) => line.trim())
      .filter((line) => line.length > 0); // Remove empty lines

    stati.forEach((line) => {
      const status = {
        line,
        documents: this.extractDocuments(line),
      };
      top.status.push(status);
    });
  }

  private extractStatusContent(statusText: string): string {
    const contentMatch = /<p>([^<]*(?:<(?!\/p>)[^<]*)*?)<\/p>/i.exec(statusText);
    return contentMatch ? contentMatch[1].trim() : statusText;
  }

  private extractDocuments(text: string): string[] {
    const documents: string[] = [];
    const regex_documents = /href="([^"]+)"/g;
    let match;

    while ((match = regex_documents.exec(text)) !== null) {
      documents.push(match[1]);
    }

    return documents;
  }
}

export default ConferenceWeekDetailParser;
