import mongoose, { Schema } from "mongoose";

const NamedPollsSchema = new Schema(
  {
    pollId: { type: Number, index: true, unique: true },
    title: String,
    date: Date,
    documents: [String],
    voteResults: [
      {
        party: String,
        yes: Number,
        no: Number,
        abstination: Number,
        notVoted: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("NamedPolls", NamedPollsSchema);
