import { NextFunction, Response } from 'express';
import { ExpressReqContext } from '../types/graphqlContext';

export const appVersion = async (req: ExpressReqContext, _res: Response, next: NextFunction) => {
  req.version = req.headers.version as string;
  next();
};
