import mongoose, { Schema } from 'mongoose';

const PartySchema = new Schema(
  {
    name: { type: String, required: true },
    aliases: [String],
    color: String,
  },
  { timestamps: true },
);

export default mongoose.model('Party', PartySchema);
