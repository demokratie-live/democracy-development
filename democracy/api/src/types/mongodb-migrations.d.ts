declare module 'mongodb-migrations' {
  import mongoose from 'mongoose';

  export interface Migrator {
    db: mongoose.Connection;
    log: Function;
  }

  export interface DoneCallback {
    (): void;
    (error: any): void;
  }

  export class Migrator {
    constructor({ directory: string }): Migrator {}

    create(path: string, name: string, callback: (err?: Error) => void) {}

    dispose(): void {}

    runFromDir(path: string, callback: (err?: Error) => void) {}
  }

  export const id = 'ProposalPrice';

  export type up = (this: Migrator, done: DoneCallback) => {};

  export type down = (this: Migrator, done: DoneCallback) => {};
}
