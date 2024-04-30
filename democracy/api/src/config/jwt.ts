export default {
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET || '',
  AUTH_JWT_TTL: process.env.AUTH_JWT_TTL || '1d',
  AUTH_JWT_REFRESH_TTL: process.env.AUTH_JWT_REFRESH_TTL || '7d',
  JWT_BACKWARD_COMPATIBILITY: process.env.JWT_BACKWARD_COMPATIBILITY === 'true',
  SECRET_KEY: process.env.SECRET_KEY || '', // Old for RSA encrypted signup call // TODO remove me
};
