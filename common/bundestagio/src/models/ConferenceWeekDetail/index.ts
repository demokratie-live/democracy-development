import mongoose from 'mongoose';
import ConferenceWeekDetailSchema, { IConferenceWeekDetail } from './schema';
import { ISession } from './ConferenceWeekDetail/Session';

export const ConferenceWeekDetailModel = mongoose.model<IConferenceWeekDetail>(
  'ConferenceWeekDetail',
  ConferenceWeekDetailSchema,
);

export type { IConferenceWeekDetail, ISession };
