import { Schema } from 'mongoose';

import Topic from './Top/Topic';
import Status from './Top/Status';

const ConferenceWeekDetailSessionTop = new Schema(
  {
    time: { type: Date, default: null },
    top: { type: String, default: null },
    heading: { type: String, default: null },
    article: { type: String, default: null },
    topic: [Topic],
    status: [Status],
  },
  { _id: false },
);

export default ConferenceWeekDetailSessionTop;
