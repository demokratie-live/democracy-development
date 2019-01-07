import { IParser } from 'scapacra';

import { DeputyProfile } from '../browser/DeputyProfileBrowser';
import { DeputyProfileEvaluator } from './evaluator/DeputyProfileEvaluator';

export = Deputy_Parser;

namespace Deputy_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class DeputyProfileParser implements IParser<DeputyProfile>{
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
        public async parse(content: DeputyProfile): Promise<any> {
            const stream = content.openStream();

            const string = await this.readStream(stream);
            const base_url: string = 'https://www.bundestag.de'

            let m;

            //Img & Name
            let img: string = '';
            let name: string = '';
            const regex_img_name = /<div class="bt-bild-standard[\s\S]*?">[\s\S]*?<img[\s\S]*?data-img-md-normal="([\s\S]*?)"[\s\S]*?title="([\s\S]*?)"[\s\S]*?>[\s\S]*?<span class="bt-bild-info-icon">/gm;
            while ((m = regex_img_name.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_img_name.lastIndex) {
                    regex_img_name.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        img = base_url + match;
                    }
                    if (group === 2) {
                        name = match;
                    }
                });
            }

            // Name + Party
            let name_party: string = '';
            let party: string = '';
            const regex_name_party = /<h3>([\s\S]*?)<\/h3>/gm;
            while ((m = regex_name_party.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_name_party.lastIndex) {
                    regex_name_party.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        name_party = match.replace(/(&nbsp;|\*)/gm, '').trim();
                        party = name_party.split(', ')[1];
                    }
                });
            }

            // Job
            let job: string = '';
            const regex_job = /<div class="bt-biografie-beruf">[\s\S]*?<p>(.*?)<\/p>/gm;
            while ((m = regex_job.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_job.lastIndex) {
                    regex_job.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        job = match;
                    }
                });
            }

            // Büro
            let buero: string[] = [];
            const regex_buero = /<h5>Abgeordnetenbüro<\/h5>[\s\S]*?<p>([\s\S]*?)<\/p>/gm;
            while ((m = regex_buero.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_buero.lastIndex) {
                    regex_buero.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        buero = match.split(/<br>|<br\/>/);
                    }
                });
            }

            // ID
            let mdb_id: string = '';
            const regex_id = /<a title="Kontakt" href="\/service\/formular\/contactform\?mdbId=(.*?)"/gm;
            while ((m = regex_id.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_id.lastIndex) {
                    regex_id.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        mdb_id = match;
                    }
                });
            }

            // Links
            let links_sel: string = '';
            let links: any[] = [];
            const regex_links_sel = /<h5>Profile im Internet<\/h5>[\s\S]*?<ul class="bt-linkliste">([\s\S]*?)<\/ul>/gm;
            const regex_links = /<a title="([\s\S]*?)" href="([\s\S]*?)"/gm;
            while ((m = regex_links_sel.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_links_sel.lastIndex) {
                    regex_links_sel.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        links_sel = match;
                    }
                });
            }
            while ((m = regex_links.exec(links_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_links.lastIndex) {
                    regex_links.lastIndex++;
                }

                let link: any = { name: '', link: '' };
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        link.name = match;
                    }
                    if (group === 2) {
                        link.link = match;
                        links.push(link);
                    }
                });
            }


            // Bio
            let bio_sel: string = '';
            let bio: string[] = [];
            const regex_bio_sel = /<h4>Biografie<\/h4>[\s\S]*?<div class="bt-collapse-padding-bottom">[\s\S]*?<div>([\s\S]*?)<\/div>/gm;
            const regex_bio = /<p>([\s\S]*?)<\/p>/gm;
            while ((m = regex_bio_sel.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_bio_sel.lastIndex) {
                    regex_bio_sel.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        bio_sel = match;
                    }
                });
            }
            while ((m = regex_bio.exec(bio_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_bio.lastIndex) {
                    regex_bio.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        bio.push(match.replace(/<\/?[^>]+(>|$)/g, ''));
                    }
                });
            }

            // WK
            let wk: string = '';
            let wk_name: string = '';
            const regex_wk = /<a title="Wahlkreis (\d*): (.*?)"/gm;
            while ((m = regex_wk.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_wk.lastIndex) {
                    regex_wk.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        wk = match;
                    }
                    if (group === 2) {
                        wk_name = match;
                    }
                });
            }

            // Ämter
            let aemter_sel: string = '';
            let aemter_raw: string[] = [];
            let aemter: any[] = [];
            const regex_aemter_sel = /<div id="bt-aemter-collapse"[\s\S]*?>([\s\S]*?)<h4>Veröffentlichungspflichtige Angaben<\/h4>/gm;
            const regex_aemter = /<h5>([\s\S]*?)<\/h5>[\s\S]*?<ul class="bt-linkliste">([\s\S]*?)<\/ul>/gm;
            const regex_amt_raw = /<a [\s\S]*?>([\s\S]*?)<\/a>/gm;
            const regex_amt_cat = /<h5>([\s\S]*?)<\/h5>/gm;
            while ((m = regex_aemter_sel.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_aemter_sel.lastIndex) {
                    regex_aemter_sel.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        aemter_sel = match;
                    }
                });
            }
            while ((m = regex_aemter.exec(aemter_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_aemter.lastIndex) {
                    regex_aemter.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    aemter_raw.push(match);
                });
            }
            aemter_raw.forEach((amt_raw) => {
                let amt: any = { cat: '', amt: [] }
                while ((m = regex_amt_cat.exec(amt_raw)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_amt_cat.lastIndex) {
                        regex_amt_cat.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            amt.cat = match.trim();
                        }
                    });
                }
                while ((m = regex_amt_raw.exec(amt_raw)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_amt_raw.lastIndex) {
                        regex_amt_raw.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            amt.amt.push(match.trim());
                        }
                    });
                }
                if (amt.cat && amt.amt.length > 0) {
                    aemter.push(amt);
                }
            })

            // Speeches URL
            let speeches_url1: string = '';
            let speeches_url2: string = '';
            let speeches_url3: string = '';
            let speeches_url4: string = '';
            const regex_speeches = /<input type="hidden" data-fid="([\s\S]*?)" data-fpropertyfield="([\s\S]*?)" data-value="([\s\S]*?)"\/>[\s\S]*?data-url="([\s\S]*?)"/gm;
            while ((m = regex_speeches.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_speeches.lastIndex) {
                    regex_speeches.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        speeches_url1 = match;
                    }
                    if (group === 2) {
                        speeches_url2 = match;
                    }
                    if (group === 3) {
                        speeches_url3 = match;
                    }
                    if (group === 4) {
                        speeches_url4 = match;
                    }
                });
            }
            const speeches: string = base_url + speeches_url4 + '?' + speeches_url2 + '=' + speeches_url1 + '%23' + speeches_url3;

            // Votes URL
            let votes: string = '';
            const regex_votes = /<div class="bt-abstimmungen-show-more bt-abstimmungen-showall">[\s\S]*?<button class="btn loadMore" type="submit" data-url="([\s\S]*?)">/gm;
            while ((m = regex_votes.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_votes.lastIndex) {
                    regex_votes.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        votes = base_url + match;
                    }
                });
            }

            // Veröffentlichungspflichtige Angaben
            let publication_requirement_sel: string = '';
            let publication_requirement: any[] = [];
            const publication_requirement_sel_regex = /<h4>Veröffentlichungspflichtige Angaben<\/h4>[\s\S]*?<ul[\s\S]*?>([\s\S]*?)<\/ul>/gm;
            const publication_requirement_regex = /<li>([\s\S]*?)<\/li>/gm;
            while ((m = publication_requirement_sel_regex.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === publication_requirement_sel_regex.lastIndex) {
                    publication_requirement_sel_regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        publication_requirement_sel = match;
                    }
                });
            }
            while ((m = publication_requirement_regex.exec(publication_requirement_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === publication_requirement_regex.lastIndex) {
                    publication_requirement_regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        publication_requirement.push(match.trim());
                    }
                });
            }

            const id = `${mdb_id}_${name}`.replace(/(\.|\/| |,)/g, '_');
            const result: any = { id, img, name, party, job, buero, links, bio, wk, wk_name, aemter, speeches, votes, publication_requirement, mdb_id };

            return [result];
        }
    }
}