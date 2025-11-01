import { User, Phone, Device } from '@democracy-deutschland/democracy-common';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      phone?: Phone | null;
      device?: Device | null;
      version?: string;
      applicationId?: string;
    }
  }
}
