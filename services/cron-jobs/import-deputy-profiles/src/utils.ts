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
export const getUsername = ({ URL: urlString, name }: IDeputyLink): string | undefined => {
  let username: string | undefined;
  try {
    const url = new URL(urlString);
    const pathParts = url.pathname.split('/').filter(Boolean);
    switch (name) {
      case 'Instagram': {
        username = pathParts[0];
        break;
      }
      case 'Twitter':
      case 'Facebook': {
        username = pathParts[0];
        if (username) {
          username = `@${username}`;
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
  }
  return username;
};
