import { Logger } from 'winston';

declare global {
  namespace NodeJS {
    interface Global {
      Log: Logger;
    }
    interface Process {
      NODE_ENV?: 'development' | 'production';
    }
  }
}

export {};
