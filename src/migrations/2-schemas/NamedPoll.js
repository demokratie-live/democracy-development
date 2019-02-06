import { Schema } from 'mongoose';

const NamedPollSchema = new Schema(
  {
    URL: { type: String, required: true, unique: true, index: true },
    webId: { type: String, required: true, unique: true },
    date: { type: Date },
    title: { type: String },
    description: { type: String },
    detailedDescription: { type: String }, // TODO trim " \n    243. Sitzung vom 29.06.2017, TOP 16 Bundeswehreinsatz im Libanon (UNIFIL)"
    documents: [{ type: String }],
    deputyVotesURL: { type: String },
    plenarProtocolURL: { type: String },
    votes: {
      // TODO subdocuments
      all: {
        // TODO move total up to unify
        total: { type: String }, // TODO rename members
        yes: { type: String },
        no: { type: String },
        abstain: { type: String },
        na: { type: String },
      },
      party: [
        {
          name: { type: String },
          members: { type: String },
          votes: {
            yes: { type: String },
            no: { type: String },
            abstain: { type: String },
            na: { type: String },
          },
        },
      ],
    },
    media: {
      // TODO subdocuments
      iTunesURL: { type: String },
      mediathekURL: { type: String },
      videoURLs: [
        {
          URL: { type: String },
          type: { type: String },
        },
      ],
    },
    speeches: [
      // TODO subdocuments
      {
        deputyName: { type: String },
        deputyImgURL: { type: String },
        mediathekURL: { type: String },
        function: { type: String },
        party: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default NamedPollSchema;
