import { Schema } from 'mongoose';

const NamedPollSpeech = new Schema(
  {
    deputyName: { type: String },
    deputyImgURL: { type: String },
    mediathekURL: { type: String },
    function: { type: String },
    party: { type: String },
  },
  { _id: false },
);

export default NamedPollSpeech;
