import { URL } from 'url';

export const getUrlParams = (url: string) => {
  const urlObj = new URL(url);
  return {
    id: urlObj.searchParams.get('id') || '',
  };
};
