import { Schema } from 'mongoose';

import Topic from './Top/Topic.js';
import Status from './Top/Status.js';

const ConferenceWeekDetailSessionTop = new Schema(
    {
        time:       { type: Date,   default: null },
        top:        { type: String, default: null },
        heading:    { type: String, default: null },
        article:    { type: String, default: null },
        topic:      [Topic],
        status:     [Status]
    },
    { _id: false },
);

export default ConferenceWeekDetailSessionTop;