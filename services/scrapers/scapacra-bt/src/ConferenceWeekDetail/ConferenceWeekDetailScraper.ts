import { IParser, IBrowser, IScraper } from "@democracy-deutschland/scapacra";
import {
  ConferenceWeekDetailsData,
  ConferenceWeekDetailsMeta,
  ConferenceWeekDetailBrowser,
} from "./ConferenceWeekDetailBrowser";
import { ConferenceWeekDetailParser } from "./ConferenceWeekDetailParser";
export = Scraper;

namespace Scraper {
  export class ConferenceWeekDetailScraper
    implements IScraper<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta> {
    private year: number;
    private week: number;

    constructor({ year = 2022, week = 41 } = {}) {
      this.year = year;
      this.week = week;
    }

    public getBrowser(): IBrowser<
      ConferenceWeekDetailsData,
      ConferenceWeekDetailsMeta
    > {
      return new ConferenceWeekDetailBrowser({
        year: this.year,
        week: this.week,
      });
    }

    public getParser(): IParser<
      ConferenceWeekDetailsData,
      ConferenceWeekDetailsMeta
    > {
      return new ConferenceWeekDetailParser();
    }
  }
}
