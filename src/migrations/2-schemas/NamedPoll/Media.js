import { Schema } from 'mongoose';

import NamedPollMediaVideoURL from './Media/VideoURL';

const NamedPollMedia = new Schema(
  {
    iTunesURL: { type: String },
    mediathekURL: { type: String },
    videoURLs: [NamedPollMediaVideoURL],
  },
  { _id: false },
);

export default NamedPollMedia;
