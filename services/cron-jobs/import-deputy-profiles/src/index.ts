import url from 'url';

import {
  setCronStart,
  setCronSuccess,
  setCronError,
  DeputyModel,
  IDeputy,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';
import scrapeIt from 'scrape-it';
import { IDeputyLink } from '@democracy-deutschland/bundestagio-common/dist/models/Deputy/Deputy/Link';

const CRON_NAME = 'DeputyProfiles';

const getUsername = ({ URL, name }: IDeputyLink) => {
  let username;
  switch (name) {
    case 'Instagram':
      const parsedUrlInstagram = url.parse(URL).pathname?.split('/');
      if (parsedUrlInstagram && parsedUrlInstagram[1]) {
        username = `${parsedUrlInstagram[1]}`;
      }
      break;
    case 'Twitter':
    case 'Facebook':
      const parsedUrlTwitter = url.parse(URL).pathname?.split('/');
      if (parsedUrlTwitter && parsedUrlTwitter[1]) {
        username = `${parsedUrlTwitter[1]}`;
      }
      username = `@${username}`;
      break;
    default:
      break;
  }
  return username;
};

type Period = 18 | 19 | 20;

const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });

  const period = parseInt(process.env.PERIOD ?? '20') as Period;
  let offset = 0;
  let hasMore = true;
  const getUrl = ({ period, offset }: { period: Period; offset: number }) => {
    switch (period) {
      case 18:
        return `https://www.bundestag.de/ajax/filterlist/webarchiv/abgeordnete/biografien18/440460-440460?limit=12&noFilterSet=true&offset=${offset}`;
      case 19:
        return `https://www.bundestag.de/ajax/filterlist/webarchiv/abgeordnete/biografien19/525246-525246?limit=12&noFilterSet=true&offset=${offset}`;
      case 20:
      default:
        return `https://www.bundestag.de/ajax/filterlist/de/abgeordnete/biografien/862712-862712?limit=20&noFilterSet=true&offset=${offset}`;
    }
  };

  try {
    while (hasMore) {
      await scrapeIt<{ deputies: Array<{ URL: string; webId: string }> }>(getUrl({ period, offset }), {
        deputies: {
          listItem: '.bt-slide:not(.bt-slide-error)',
          data: {
            URL: {
              selector: 'div.bt-slide-content > a',
              attr: 'href',
              convert: (href: string) => `https://www.bundestag.de${href}`,
            },
            webId: {
              selector: 'div.bt-slide-content > a',
              attr: 'data-id',
            },
          },
        },
      }).then(async ({ data: deputyList }) => {
        for (const deputyListItem of deputyList.deputies) {
          await scrapeIt<Omit<IDeputy, 'URL' | 'webId' | 'period'>>(encodeURI(deputyListItem.URL), {
            imgURL: {
              selector: '.bt-bild-standard > img',
              attr: 'data-img-md-normal',
              convert: (src: string) => `https://www.bundestag.de${src}`,
            },
            biography: {
              listItem: '#ptv1 p',
              convert: (text: string) => (typeof text === 'string' ? text.trim() : undefined),
            },
            party: {
              selector: 'div.bt-biografie-name > h3',
              convert: (text: string) => text.split(',')[1]?.replace(/\*/gi, '').trim(),
            },
            name: {
              selector: 'div.bt-biografie-name > h3',
              convert: (text: string) => text.split(',')[0]?.trim(),
            },
            job: 'div.bt-biografie-name > div > p',
            office: {
              selector: '#bt-kontakt-collapse > div > div:nth-child(1) > p',
              how: 'html',
              convert: (text: string) => text?.split('<br>'),
            },
            links: {
              listItem: '.bt-profil-kontakt .bt-linkliste li',
              data: {
                name: {
                  selector: 'a',
                  attr: 'title',
                },
                URL: {
                  selector: 'a',
                  attr: 'href',
                },
              },
            },
            constituency: {
              selector: '.bt-wk-map a',
              attr: 'title',
              convert: (text: string) => {
                const rx = /Wahlkreis (\d{3})/;
                const arr = rx.exec(text);
                return arr?.[1];
              },
            },
            constituencyName: {
              selector: '.bt-wk-map a',
              attr: 'title',
              convert: (text: string) => {
                const rx = /Wahlkreis \d{3}: (.*?)$/;
                const arr = rx.exec(text);
                return arr?.[1];
              },
            },
            directCandidate: {
              selector: 'div:has(>#bt-landesliste-collapse) > div:first-child h4',
              convert: (text: string) => text === 'Direkt gewählt',
            },
          }).then(async ({ data: deputyData }) => {
            const deputy = {
              period,
              URL: deputyListItem.URL,
              webId: deputyListItem.webId,
              ...deputyData,
              biography: deputyData.biography.filter((d: string) => d),
              links: deputyData.links.map((link) => ({
                ...link,
                username: getUsername(link),
              })),
            };

            console.log(deputy.name);

            await DeputyModel.updateOne({ webId: deputy.webId }, { $set: deputy }, { upsert: true });
          });
        }
        if (deputyList.deputies.length) {
          offset += deputyList.deputies.length;
        } else {
          hasMore = false;
        }
        console.log(`offset: ${offset} 🚀`);
      });
    }

    console.log('done 🥳');
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
  }

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect();
  console.log('deputies', await DeputyModel.countDocuments({}));
  await start();
  process.exit(0);
})();
