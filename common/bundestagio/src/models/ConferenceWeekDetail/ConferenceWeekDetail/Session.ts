import { Schema } from "mongoose";

import Top, { ITop } from "./Session/Top";

export interface ISession {
  date: Date | null;
  dateText: string | null;
  session: string | null;
  tops: ITop[];
}

const ConferenceWeekDetailSession = new Schema(
  {
    date: { type: Date, default: null },
    dateText: { type: String, default: null },
    session: { type: String, default: null },
    tops: [Top],
  },
  { _id: false }
);

export default ConferenceWeekDetailSession;
