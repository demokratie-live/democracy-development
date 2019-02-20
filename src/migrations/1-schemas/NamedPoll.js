import { Schema } from 'mongoose';

const NamedPollSchema = new Schema(
  {
    pollId: { type: Number, index: true, unique: true },
    title: String,
    date: Date,
    documents: [String],
    yes: Number,
    abstination: Number,
    no: Number,
    notVoted: Number,
    voteResults: [
      {
        party: String,
        yes: Number,
        no: Number,
        abstination: Number,
        notVoted: Number,
      },
    ],
  },
  { timestamps: true },
);

NamedPollSchema.index({ createdAt: 1 });

export default NamedPollSchema;
