declare global {
  namespace NodeJS {
    interface Global {
      Log: Logger;
    }
  }
}
declare namespace NodeJS {
  import { Logger } from 'winston';

  interface Global {
    Log: Logger;
  }

  interface Process {
    NODE_ENV?: 'development' | 'production';
  }
}
