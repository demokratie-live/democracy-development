import { URL } from 'url';

export const getUrlParams = (url: string) => {
  const urlParams = new URL(url).search.substring(1);

  const paramsObject = JSON.parse(
    '{"' + decodeURI(urlParams).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}',
  );

  return paramsObject;
};
