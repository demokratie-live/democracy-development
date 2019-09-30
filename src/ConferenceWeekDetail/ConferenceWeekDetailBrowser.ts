import { IDataPackage, DataType, IBrowser } from '@democracy-deutschland/scapacra';
import axios = require('axios');
import { resolve } from 'path';

// import { URL } from 'url';

// import { NamedPollHrefEvaluator } from '../NamedPoll/NamedPollHrefEvaluator';


// import { url } from 'inspector';

export = Browser;

namespace Browser {
    export class ConferenceWeekDetails extends DataType {
    }

    /**
     * Abstract browser which implements the base navigation of a Bundestag document list. 
     */
    export class ConferenceWeekDetailBrowser implements IBrowser<ConferenceWeekDetails>{
        private currentYear: Number | null = 2014;
        private currentWeek: Number | null = 8;

        private buildURL(year: Number, week: Number): string{
            return `https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=${year}&week=${week}`
        }

        public async next(): Promise<IteratorResult<Promise<IDataPackage<ConferenceWeekDetails>>>> {
            if (!this.currentYear || !this.currentWeek) {
                return {
                    done: true,
                    value: null
                }
            }

            const url = this.buildURL(this.currentYear,this.currentWeek)

            let response = await axios.default.get(
                url,
                {
                    withCredentials: false,
                    method: 'get',
                    responseType: 'blob'
                }
            );

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
                let result =    Promise.resolve({
                                    metadata: {
                                        url,
                                        description: `${this.currentYear}_${this.currentWeek}`
                                    },
                                    data: new ConferenceWeekDetails(response.data)
                                });
                
                this.currentYear = nextYear;
                this.currentWeek = nextWeek;
                
                return {
                    done: false,
                    value: result
                }
            } else {
                throw new Error(response.statusText);
            }
        }

        [Symbol.asyncIterator](): AsyncIterableIterator<Promise<IDataPackage<ConferenceWeekDetails>>> {
            return this;
        }
    }
}