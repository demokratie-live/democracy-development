if (!process.env.BUNDESTAGIO_SERVER_URL) {
  throw new Error('Please define the BUNDESTAGIO_SERVER_URL environment variable inside .env.local');
}

export const config = {
  BUNDESTAGIO_SERVER_URL: process.env.BUNDESTAGIO_SERVER_URL,
};
