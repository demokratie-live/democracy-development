import { DataPackage, IParser } from '@democracy-deutschland/scapacra';
import { NamedPollDeputiesData, NamedPollDeputiesMeta } from './NamedPollDeputyBrowser';

/**
 * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
 */
export class NamedPollDeputyParser implements IParser<NamedPollDeputiesData, NamedPollDeputiesMeta> {
  private async readStream(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve) => {
      let data = '';
      stream.setEncoding('utf8');
      stream
        .on('data', (chunk: string) => {
          data += chunk;
        })
        .on('end', () => {
          resolve(data);
        });
    });
  }

  public async parse(
    data: DataPackage<NamedPollDeputiesData, NamedPollDeputiesMeta>,
  ): Promise<DataPackage<object, object>> {
    const string = data.data ? await this.readStream(data.data) : '';
    const base_url: string = 'https://www.bundestag.de';

    let m;

    //id
    let id: string | null = null;
    if (data.meta && data.meta.url) {
      const regex_id = /id=(.*)/gm;
      while ((m = regex_id.exec(data.meta.url)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex_id.lastIndex) {
          regex_id.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m.forEach((match, group) => {
          if (group === 1) {
            id = match;
          }
        });
      }
    }

    let resultAll: {
      total: number | null;
      yes: number | null;
      no: number | null;
      abstain: number | null;
      na: number | null;
    } = { total: null, yes: null, no: null, abstain: null, na: null }; // TODO Typescript
    const regex_membersVoted = /<h3> (.*?) Mitglieder<\/h3>/gm;
    const regex_ResultAll =
      /<ul class="bt-chart-legend">[\s\S]*?<li class="bt-legend-ja"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-nein"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-enthalten"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-na"><span>(.*?)<\/span>/gm;
    while ((m = regex_membersVoted.exec(string)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex_membersVoted.lastIndex) {
        regex_membersVoted.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, group) => {
        if (group === 1) {
          resultAll.total = parseInt(match, 10) || 0;
        }
      });
    }
    while ((m = regex_ResultAll.exec(string)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex_ResultAll.lastIndex) {
        regex_ResultAll.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, group) => {
        if (group === 1) {
          resultAll.yes = parseInt(match, 10) || 0;
        }
        if (group === 2) {
          resultAll.no = parseInt(match, 10) || 0;
        }
        if (group === 3) {
          resultAll.abstain = parseInt(match, 10) || 0;
        }
        if (group === 4) {
          resultAll.na = parseInt(match, 10) || 0;
        }
      });
    }

    let deputies: Array<{
      id: string | null;
      URL: string | null;
      imgURL: string | null;
      state: string | null;
      name: string | null;
      party: string | null;
      vote: string | null;
    }> = [];
    const regex_deputySel = /<div class="bt-slide-content">([\s\S]*?)<\/a>[\s\S]*?<\/div>[\s\S]*?<\/div>/gm;
    const regex_deputy =
      /<a href="(.*?)\?subview=na"[\s\S]*?<img[\s\S]*?data-img-md-normal="(.*?)"[\s\S]*?<div class="bt-teaser-person-text" data-bundesland="(.*?)"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<p class="bt-person-fraktion">(.*?)<\/p>[\s\S]*?<p class="bt-person-abstimmung bt-abstimmung-(.*?)">/gm;
    const regex_deputyId = /https:\/\/www\.bundestag\.de\/.*?(\d+)/gm;
    while ((m = regex_deputySel.exec(string)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex_deputySel.lastIndex) {
        regex_deputySel.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, group) => {
        if (group === 0) {
          //full match
          let n;
          while ((n = regex_deputy.exec(match)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (n.index === regex_deputy.lastIndex) {
              regex_deputy.lastIndex++;
            }
            let deputy: {
              id: string | null;
              URL: string | null;
              imgURL: string | null;
              state: string | null;
              name: string | null;
              party: string | null;
              vote: string | null;
            } = { id: null, URL: null, imgURL: null, state: null, name: null, party: null, vote: null };
            // The result can be accessed through the `n`-variable.
            n.forEach((match2, group2) => {
              if (group2 === 1) {
                if (match2) {
                  deputy.URL = match2.indexOf('http') !== -1 ? match2 : base_url + match2;
                  let o;
                  while ((o = regex_deputyId.exec(deputy.URL)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (o.index === regex_deputyId.lastIndex) {
                      regex_deputyId.lastIndex++;
                    }
                    // The result can be accessed through the `o`-variable.
                    o.forEach((match3, group3) => {
                      if (group3 === 1) {
                        deputy.id = match3;
                      }
                    });
                  }
                }
              }
              if (group2 === 2) {
                if (match2) {
                  deputy.imgURL = match2.indexOf('http') !== -1 ? match2 : base_url + match2;
                }
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

    return new DataPackage<object, object>({ id, votes: { all: resultAll, deputies } }, data.meta);
  }
}

export default NamedPollDeputyParser;
