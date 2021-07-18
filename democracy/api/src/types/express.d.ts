import { ExpressReqContext } from './graphqlContext';

declare namespace Express {
  export type Request = ExpressReqContext
}
