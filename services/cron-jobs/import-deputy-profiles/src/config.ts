import { Period } from './types';

export const CRON_NAME = 'DeputyProfiles';
export const isDebug = process.env.DEBUG === 'true';

export const commonHeaders = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Sec-Fetch-Site': 'none',
  Cookie:
    'enodia=eyJleHAiOjE3NDAwMzA2OTIsImNvbnRlbnQiOnRydWUsImF1ZCI6ImF1dGgiLCJIb3N0Ijoid3d3LmJ1bmRlc3RhZy5kZSIsIlNvdXJjZUlQIjoiMTc4LjIwMi4xNDUuNDUiLCJDb25maWdJRCI6IjhkYWRjZTEyNWZkMmMzOTMyYjk0M2I1MmU5ZDJjZDY1MDU3NTRlMTYyMjEyYTJjZTFiYjVhZjE1YzBkNGJiZmUifQ==.JRuo6FZFiCz8Ww83ShK_5qfzC0D5XBaKI4r89I0AOZA=',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Mode': 'navigate',
  Host: 'www.bundestag.de',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
  'Accept-Language': 'de-DE,de;q=0.9',
  'Sec-Fetch-Dest': 'document',
  Connection: 'keep-alive',
};

export const getDeputyListUrl = ({ period, offset }: { period: Period; offset: number }): string => {
  switch (period) {
    case 18:
      return `https://www.bundestag.de/ajax/filterlist/webarchiv/abgeordnete/biografien18/440460-440460?limit=12&noFilterSet=true&offset=${offset}`;
    case 19:
      return `https://www.bundestag.de/ajax/filterlist/webarchiv/abgeordnete/biografien19/525246-525246?limit=12&noFilterSet=true&offset=${offset}`;
    case 20:
      return `https://www.bundestag.de/ajax/filterlist/de/abgeordnete/biografien/862712-862712?limit=20&noFilterSet=true&offset=${offset}`;
    case 21:
    default:
      return `https://www.bundestag.de/ajax/filterlist/de/abgeordnete/biografien/Abgeordnete21/1040594-1040594?limit=20&noFilterSet=true&offset=${offset}`;
  }
};
