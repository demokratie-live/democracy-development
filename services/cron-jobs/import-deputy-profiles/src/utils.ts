import url from 'url';
import { isDebug } from './config';
import { IDeputyLink } from './types';

export const debugCheck = (field: string, value: unknown, context: string = ''): void => {
  if (isDebug) {
    if (!value) {
      console.log(`[DEBUG] Missing ${field}${context ? ' in ' + context : ''}`);
    } else {
      console.log(`[DEBUG] Found ${field}:`, value, context);
    }
  }
};

/**
 * Extracts username from social media links
 */
export const getUsername = ({ URL, name }: IDeputyLink): string | undefined => {
  let username: string | undefined;
  switch (name) {
    case 'Instagram': {
      const parsed = url.parse(URL).pathname?.split('/');
      if (parsed && parsed[1]) {
        username = `${parsed[1]}`;
      }
      break;
    }
    case 'Twitter':
    case 'Facebook': {
      const parsed = url.parse(URL).pathname?.split('/');
      if (parsed && parsed[1]) {
        username = `${parsed[1]}`;
      }
      if (username) {
        username = `@${username}`;
      }
      break;
    }
    default:
      break;
  }
  return username;
};
