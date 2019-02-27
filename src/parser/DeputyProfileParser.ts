import { IDataPackage, IParser } from '@democracy-deutschland/scapacra';

import { DeputyProfile } from '../browser/DeputyProfileBrowser';

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
        public async parse(data: IDataPackage<DeputyProfile>): Promise<IDataPackage<any>[]> {
            const stream = data.data.openStream();

            const string = await this.readStream(stream);
            const base_url: string = 'https://www.bundestag.de'

            let m;

            // ImgURL & Name
            let imgURL: string = '';
            let name: string = '';
            const regex_imgURL_name = /<div class="bt-bild-standard[\s\S]*?">[\s\S]*?<img[\s\S]*?data-img-md-normal="([\s\S]*?)"[\s\S]*?title="([\s\S]*?)"[\s\S]*?>[\s\S]*?<span class="bt-bild-info-icon">/gm;
            while ((m = regex_imgURL_name.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_imgURL_name.lastIndex) {
                    regex_imgURL_name.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        imgURL = base_url + match;
                    }
                    if (group === 2) {
                        name = match;
                    }
                });
            }

            // ImgCopyright
            let imgCopyright: string = '';
            const regex_imgCopyright = /<div class="bt-bild-info-text">[\s\S]*?<p>&copy;&nbsp;(.*?)<\/p>/gm;
            while ((m = regex_imgCopyright.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_imgCopyright.lastIndex) {
                    regex_imgCopyright.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        imgCopyright = match;
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

            // Office
            let office: string[] = [];
            const regex_office = /<h5>Abgeordnetenbüro<\/h5>[\s\S]*?<p>([\s\S]*?)<\/p>/gm;
            while ((m = regex_office.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_office.lastIndex) {
                    regex_office.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        office = match.split(/<br>|<br\/>/);
                    }
                });
            }

            // ID
            let id: string = '';
            if (data.metadata.url) {
                const regex_id = /https:\/\/www\.bundestag\.de\/abgeordnete\/.*-(\d+)/gm;
                while ((m = regex_id.exec(data.metadata.url)) !== null) {
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
            if (!id) {
                const regex_id = /<a title="Kontakt" href="\/service\/formular\/contactform\?mdbId=(.*?)"/gm;
                while ((m = regex_id.exec(string)) !== null) {
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

                let link: any = { name: '', URL: '' };
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        link.name = match;
                    }
                    if (group === 2) {
                        link.URL = match;
                        links.push(link);
                    }
                });
            }


            // Biography
            let biography_sel: string = '';
            let biography: string[] = [];
            const regex_biography_sel = /<h4>Biografie<\/h4>[\s\S]*?<div class="bt-collapse-padding-bottom">[\s\S]*?<div>([\s\S]*?)<\/div>/gm;
            const regex_biography = /<p>([\s\S]*?)<\/p>/gm;
            while ((m = regex_biography_sel.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_biography_sel.lastIndex) {
                    regex_biography_sel.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        biography_sel = match;
                    }
                });
            }
            while ((m = regex_biography.exec(biography_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_biography.lastIndex) {
                    regex_biography.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        biography.push(match.replace(/<\/?[^>]+(>|$)/g, ''));
                    }
                });
            }

            // directCandidate
            let directCandidate: boolean = false; // /<h4>Gewählt über Landesliste<\/h4>/
            const regex_directCandidate = /<h4>Direkt gewählt<\/h4>/;
            if (regex_directCandidate.exec(string) !== null) {
                directCandidate = true;
            }

            // Constituency
            let constituency: string = '';
            let constituencyName: string = '';
            const regex_constituency = /<a title="Wahlkreis (\d*): (.*?)"/gm;
            while ((m = regex_constituency.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_constituency.lastIndex) {
                    regex_constituency.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        constituency = match;
                    }
                    if (group === 2) {
                        constituencyName = match;
                    }
                });
            }

            // Functions (Ämter)
            let functions_sel: string = '';
            let functions_raw: string[] = [];
            let functions: any[] = [];
            const regex_functions_sel = /<div id="bt-aemter-collapse"[\s\S]*?>([\s\S]*?)<h4>Veröffentlichungspflichtige Angaben<\/h4>/gm;
            const regex_functions = /<h5>([\s\S]*?)<\/h5>[\s\S]*?<ul class="bt-linkliste">([\s\S]*?)<\/ul>/gm;
            const regex_functions_functions_raw = /<a [\s\S]*?>([\s\S]*?)<\/a>/gm;
            const regex_functions_functions_cat = /<h5>([\s\S]*?)<\/h5>/gm;
            while ((m = regex_functions_sel.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_functions_sel.lastIndex) {
                    regex_functions_sel.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        functions_sel = match;
                    }
                });
            }
            while ((m = regex_functions.exec(functions_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_functions.lastIndex) {
                    regex_functions.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    functions_raw.push(match);
                });
            }
            functions_raw.forEach((functions_functions_raw) => {
                let f: any = { category: '', functions: [] }
                while ((m = regex_functions_functions_cat.exec(functions_functions_raw)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_functions_functions_cat.lastIndex) {
                        regex_functions_functions_cat.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            f.category = match.trim();
                        }
                    });
                }
                while ((m = regex_functions_functions_raw.exec(functions_functions_raw)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_functions_functions_raw.lastIndex) {
                        regex_functions_functions_raw.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            f.functions.push(match.trim());
                        }
                    });
                }
                if (f.category && f.functions.length > 0) {
                    functions.push(f);
                }
            })

            // SpeechesURL
            let speechesURL1: string = '';
            let speechesURL2: string = '';
            let speechesURL3: string = '';
            let speechesURL4: string = '';
            const regex_speechesURL = /<input type="hidden" data-fid="([\s\S]*?)" data-fpropertyfield="([\s\S]*?)" data-value="([\s\S]*?)"\/>[\s\S]*?data-url="([\s\S]*?)"/gm;
            while ((m = regex_speechesURL.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_speechesURL.lastIndex) {
                    regex_speechesURL.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        speechesURL1 = match;
                    }
                    if (group === 2) {
                        speechesURL2 = match;
                    }
                    if (group === 3) {
                        speechesURL3 = match;
                    }
                    if (group === 4) {
                        speechesURL4 = match;
                    }
                });
            }
            const speechesURL: string = base_url + speechesURL4 + '?' + speechesURL2 + '=' + speechesURL1 + '%23' + speechesURL3;

            // VotesURL
            let votesURL: string = '';
            const regex_votesURL = /<div class="bt-abstimmungen-show-more bt-abstimmungen-showall">[\s\S]*?<button class="btn loadMore" type="submit" data-url="([\s\S]*?)">/gm;
            while ((m = regex_votesURL.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_votesURL.lastIndex) {
                    regex_votesURL.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        votesURL = base_url + match;
                    }
                });
            }

            // publicationRequirement (Veröffentlichungspflichtige Angaben)
            let publicationRequirement_sel: string = '';
            let publicationRequirement: any[] = [];
            const publicationRequirement_sel_regex = /<h4>Veröffentlichungspflichtige Angaben<\/h4>[\s\S]*?<ul[\s\S]*?>([\s\S]*?)<\/ul>/gm;
            const publicationRequirement_regex = /<li>([\s\S]*?)<\/li>/gm;
            while ((m = publicationRequirement_sel_regex.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === publicationRequirement_sel_regex.lastIndex) {
                    publicationRequirement_sel_regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        publicationRequirement_sel = match;
                    }
                });
            }
            while ((m = publicationRequirement_regex.exec(publicationRequirement_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === publicationRequirement_regex.lastIndex) {
                    publicationRequirement_regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        publicationRequirement.push(match.trim());
                    }
                });
            }

            const result: any = {
                id,
                imgURL,
                imgCopyright,
                name,
                party,
                job,
                office,
                links,
                biography,
                directCandidate,
                constituency,
                constituencyName,
                functions,
                speechesURL,
                votesURL,
                publicationRequirement
            };

            return [{
                metadata: data.metadata,
                data: result
            }];
        }
    }
}