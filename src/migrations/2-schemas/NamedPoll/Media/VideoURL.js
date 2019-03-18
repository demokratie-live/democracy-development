import { Schema } from 'mongoose';

const NamedPollMediaVideoURL = new Schema(
  {
    URL: { type: String },
    description: { type: String },
  },
  { _id: false },
);

export default NamedPollMediaVideoURL;
