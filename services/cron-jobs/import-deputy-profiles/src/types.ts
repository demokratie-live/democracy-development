import { IDeputy } from '@democracy-deutschland/bundestagio-common';
import { IDeputyLink } from '@democracy-deutschland/bundestagio-common/dist/models/Deputy/Deputy/Link';

export type Period = 18 | 19 | 20;

export interface DeputyListItem {
  URL: string;
  webId: string;
}

export type DeputyScrapedData = Omit<IDeputy, 'URL' | 'webId' | 'period'>;

export { IDeputyLink };
