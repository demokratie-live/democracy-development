export const {
  DIP_API_KEY = '',
  DIP_API_ENDPOINT = 'https://search.dip.bundestag.de'
} = process.env
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3101;
