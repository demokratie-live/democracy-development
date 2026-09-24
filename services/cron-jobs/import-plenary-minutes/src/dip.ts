import axios from 'axios';

import { DipPlenarprotokoll, DipPlenarprotokollResponse } from './types';

const DIP_URL = 'https://search.dip.bundestag.de/api/v1/plenarprotokoll';

const fetchPage = async (apiKey: string, period: number, cursor?: string) => {
  try {
    const { data } = await axios.get<DipPlenarprotokollResponse>(DIP_URL, {
      headers: { Authorization: `ApiKey ${apiKey}` },
      params: { 'f.wahlperiode': period, 'f.zuordnung': 'BT', cursor },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const reason = error.response ? `HTTP ${error.response.status}` : error.code ?? error.message;
      throw new Error(`DIP request for period ${period} failed with ${reason}`);
    }
    throw error;
  }
};

export const fetchPlenarprotokolle = async (apiKey: string, period: number) => {
  const documents: DipPlenarprotokoll[] = [];
  let cursor: string | undefined;
  let page: DipPlenarprotokollResponse;
  do {
    page = await fetchPage(apiKey, period, cursor);
    documents.push(...page.documents);
    // DIP returns the same cursor again once the last page is reached
    cursor = page.cursor === cursor ? undefined : page.cursor;
  } while (cursor && page.documents.length > 0);

  if (documents.length === 0) {
    throw new Error(`DIP returned no plenary minutes for period ${period}`);
  }
  return documents;
};
