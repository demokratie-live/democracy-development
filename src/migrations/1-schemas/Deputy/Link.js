import { Schema } from 'mongoose';

const DeputyLink = new Schema(
  {
    name: { type: String },
    URL: { type: String },
  },
  { _id: false },
);

export default DeputyLink;
