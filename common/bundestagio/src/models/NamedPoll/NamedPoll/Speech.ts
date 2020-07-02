import { Schema } from "mongoose";

export interface INamedPollSpeech {
  deputyName?: string;
  deputyImgURL?: string;
  mediathekURL?: string;
  function?: string;
  party?: string;
}

const NamedPollSpeech = new Schema(
  {
    deputyName: { type: String },
    deputyImgURL: { type: String },
    mediathekURL: { type: String },
    function: { type: String },
    party: { type: String },
  },
  { _id: false }
);

export default NamedPollSpeech;
