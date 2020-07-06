import { DataPackage, IBrowser } from "@democracy-deutschland/scapacra";
import axios = require("axios");

export = Browser;

namespace Browser {
  export type ConferenceWeekDetailsData = string;
  export type ConferenceWeekDetailsMeta = {
    url: string;
    currentYear: Number;
    currentWeek: Number;
  };

  /**
   * Abstract browser which implements the base navigation of a Bundestag document list.
   */
  export class ConferenceWeekDetailBrowser
    implements IBrowser<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta> {
    private currentYear: number | null;
    private currentWeek: number | null;

    constructor({ year, week }: { year: number; week: number }) {
      this.currentYear = year;
      this.currentWeek = week;
    }

    private buildURL(year: Number, week: Number): string {
      return `https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?limit=1&year=${year}&week=${week}`;
    }

    public async next(): Promise<
      IteratorResult<
        Promise<
          DataPackage<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta>
        >
      >
    > {
      if (!this.currentYear || !this.currentWeek) {
        return {
          done: true,
          value: null,
        };
      }

      const url = this.buildURL(this.currentYear, this.currentWeek);

      let response = await axios.default.get(url, {
        withCredentials: false,
        method: "get",
        responseType: "blob",
      });

      if (response.status === 200) {
        let m;
        let nextYear: Number | null = null;
        let nextWeek: Number | null = null;
        const regex_nextYearWeek = /data-nextyear="(\d*)" data-nextweeknumber="(\d*)"/gm;
        while ((m = regex_nextYearWeek.exec(response.data)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex_nextYearWeek.lastIndex) {
            regex_nextYearWeek.lastIndex++;
          }
          // The result can be accessed through the `m`-variable.
          m.forEach((match, group) => {
            if (group === 1) {
              nextYear = parseInt(match, 10) || null;
            }
            if (group === 2) {
              nextWeek = parseInt(match, 10) || null;
            }
          });
        }
        let result = Promise.resolve(
          new DataPackage<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta>(
            response.data,
            {
              url,
              currentYear: this.currentYear,
              currentWeek: this.currentWeek,
            }
          )
        );

        this.currentYear = nextYear;
        this.currentWeek = nextWeek;

        return {
          done: false,
          value: result,
        };
      } else {
        throw new Error(response.statusText);
      }
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<
      Promise<DataPackage<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta>>
    > {
      return this;
    }
  }
}
