import { DataPackage, IParser } from '@democracy-deutschland/scapacra';
import moment from 'moment';
import { JSDOM } from 'jsdom';
import { DOMParser } from 'xmldom';

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

// Use DOM types instead of directly importing from xmldom
type XmldomNode = globalThis.Node;
type XmldomElement = globalThis.Element;

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

    const dom = new JSDOM(string);
    const element = dom.window.document.querySelector(
      '[data-previousyear][data-previousweeknumber][data-nextyear][data-nextweeknumber]',
    );

    if (element) {
      lastYear = parseInt(element.getAttribute('data-previousyear') || '', 10) || null;
      lastWeek = parseInt(element.getAttribute('data-previousweeknumber') || '', 10) || null;
      nextYear = parseInt(element.getAttribute('data-nextyear') || '', 10) || null;
      nextWeek = parseInt(element.getAttribute('data-nextweeknumber') || '', 10) || null;
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

    if (!string || string.trim() === '') {
      return sessions;
    }

    const parser = new DOMParser();
    const dom = parser.parseFromString(string, 'text/html');

    // Funktion zum Finden aller caption-Elemente im XML-DOM
    const findCaptions = (node: XmldomNode | null | undefined): XmldomElement[] => {
      const captions: XmldomElement[] = [];
      if (!node) {
        return captions;
      }

      if (node.nodeName === 'caption') {
        captions.push(node as XmldomElement);
      }
      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          captions.push(...findCaptions(node.childNodes[i]));
        }
      }
      return captions;
    };

    const captions = findCaptions(dom);

    captions.forEach((caption) => {
      // Suche nach .bt-conference-title innerhalb des caption elements
      let titleElement = null;
      for (let i = 0; i < caption.childNodes.length; i++) {
        const child = caption.childNodes[i];
        if (
          child.nodeName === 'div' &&
          (child as XmldomElement).attributes &&
          (child as XmldomElement).getAttribute('class') === 'bt-conference-title'
        ) {
          titleElement = child;
          break;
        }
      }

      if (!titleElement) return;

      // Zur Tabelle und zum tbody navigieren
      const tableElement = caption.parentNode;
      if (!tableElement) return;

      let tbodyElement = null;
      if (tableElement.childNodes) {
        for (let i = 0; i < tableElement.childNodes.length; i++) {
          if (tableElement.childNodes[i].nodeName === 'tbody') {
            tbodyElement = tableElement.childNodes[i];
            break;
          }
        }
      }

      if (!tbodyElement) return;

      // Daten aus dem title Element extrahieren
      const titleText = titleElement.textContent || '';
      const dateTextMatch = titleText.match(/^([^(]*)/);
      const sessionNumberMatch = titleText.match(/\((\d+)\. Sitzung\)/);

      const dateText = dateTextMatch ? dateTextMatch[1].trim() : '';
      const sessionNumber = sessionNumberMatch ? sessionNumberMatch[1] : '';

      // Daten des Sitzungskörpers extrahieren
      const sessionData = tbodyElement.toString();

      const session = this.parseSession(dateText, sessionNumber, sessionData);
      sessions.push(session);
    });

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
    let lastTopTime: Date | null = null;
    let newDay = false;

    // Create a DOM from the session data
    const dom = new JSDOM(`<table><tbody>${sessionData}</tbody></table>`);
    const rows = dom.window.document.querySelectorAll('tr');

    rows.forEach((row) => {
      const timeCell = row.querySelector('td[data-th="Uhrzeit"] p');
      const topCell = row.querySelector('td[data-th="TOP"] p');
      const themaCell = row.querySelector('td[data-th="Thema"] .bt-documents-description');
      const statusCell = row.querySelector('td[data-th="Status/ Abstimmung"]');

      if (timeCell && topCell && themaCell && statusCell) {
        const timeStr = timeCell.textContent || '';
        const topStr = topCell.textContent || '';
        const topicStr = themaCell.outerHTML || '';
        const statusStr = statusCell.outerHTML || '';

        const top = this.parseTop(timeStr, topStr, topicStr, statusStr, sessionDateText);

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
    });

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
    // Use JSDOM to parse the HTML content
    const dom = new JSDOM(`<div>${topic}</div>`);
    const document = dom.window.document;

    // Extract heading from the collapser link
    const headingElement = document.querySelector('a.bt-top-collapser.collapser');
    if (headingElement && headingElement.textContent) {
      top.heading = headingElement.textContent.trim();
    }

    // Extract article URL from button with data-url attribute
    const articleElement = document.querySelector('button[data-url]');
    if (articleElement) {
      const url = articleElement.getAttribute('data-url');
      if (url) {
        top.article = url.startsWith('http') ? url : `https://www.bundestag.de${url}`;
      }
    }

    const topicContent = this.extractTopicContent(topic);
    top.topic = this.parseTopicParts(topicContent);
  }

  private extractTopicContent(topic: string): string {
    // First try to extract content from <p> tags
    const contentMatch = /<p>([^<]*(?:<(?!\/p>)[^<]*)*?)<\/p>/i.exec(topic);
    // Standardize all line break formats to <br/>
    const content = contentMatch ? contentMatch[1].trim() : topic;
    return content.replace(/<br\s*\/?>/gi, '<br/>');
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
