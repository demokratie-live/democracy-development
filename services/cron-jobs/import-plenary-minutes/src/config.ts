const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`you have to set environment variable: ${name}`);
  }
  return value;
};

export const getConfig = () => ({
  DB_URL: requireEnv('DB_URL'),
  DIP_API_KEY: requireEnv('DIP_API_KEY'),
});
