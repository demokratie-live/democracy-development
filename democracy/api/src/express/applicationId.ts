import { NextFunction, Response } from 'express';
import { ExpressReqContext } from '../types/graphqlContext';

export const applicationId = async (req: ExpressReqContext, _res: Response, next: NextFunction) => {
  req.applicationId = req.headers['application-id'] as string;
  next();
};
