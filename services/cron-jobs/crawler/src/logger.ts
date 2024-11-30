export interface Logger {
  info: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string) => void;
}

export const logger: Logger = {
  info: (message: string): void => {
    console.info(message);
  },
  debug: (message: string): void => {
    console.debug(message);
  },
  error: (message: string): void => {
    console.error(message);
  },
};
