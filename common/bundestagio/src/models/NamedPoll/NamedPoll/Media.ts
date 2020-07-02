import { Schema } from "mongoose";

import NamedPollMediaVideoURL, {
  INamedPollMediaVideoURL,
} from "./Media/VideoURL";

export interface INamedPollMedia {
  iTunesURL?: string;
  mediathekURL?: string;
  videoURLs?: INamedPollMediaVideoURL[];
}

const NamedPollMedia = new Schema(
  {
    iTunesURL: { type: String },
    mediathekURL: { type: String },
    videoURLs: [NamedPollMediaVideoURL],
  },
  { _id: false }
);

export default NamedPollMedia;
