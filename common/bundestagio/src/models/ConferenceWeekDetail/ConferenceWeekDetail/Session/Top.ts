import { Schema } from "mongoose";

import Topic, { ITopic } from "./Top/Topic";
import Status, { IStatus } from "./Top/Status";

export interface ITop {
  time: Date | null;
  top: string | null;
  heading: string | null;
  article: string | null;
  topic: ITopic[];
  status: IStatus[];
}

const ConferenceWeekDetailSessionTop = new Schema(
  {
    time: { type: Date, default: null },
    top: { type: String, default: null },
    heading: { type: String, default: null },
    article: { type: String, default: null },
    topic: [Topic],
    status: [Status],
  },
  { _id: false }
);

export default ConferenceWeekDetailSessionTop;
