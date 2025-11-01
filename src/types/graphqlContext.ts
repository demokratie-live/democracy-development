import { Response, Request } from 'express';
import DataLoader from 'dataloader';
import {
  ProcedureModel,
  VoteModel,
  DeviceModel,
  Device,
  UserModel,
  User,
  DeputyModel,
  ActivityModel,
  SearchTermModel,
  VerificationModel,
  PhoneModel,
  Phone,
} from '@democracy-deutschland/democracy-common';

export interface GraphQlContext {
  ProcedureModel: typeof ProcedureModel;
  VoteModel: typeof VoteModel;
  ActivityModel: typeof ActivityModel;
  DeviceModel: typeof DeviceModel;
  DeputyModel: typeof DeputyModel;
  SearchTermModel: typeof SearchTermModel;
  PhoneModel: typeof PhoneModel;
  VerificationModel: typeof VerificationModel;
  UserModel: typeof UserModel;
  res: Response;
  user: User;
  phone: Phone;
  device: Device;
  version?: string;
  applicationId?: string;
  votedLoader: DataLoader<string, boolean, unknown>;
}

export type ExpressReqContext = Request;
