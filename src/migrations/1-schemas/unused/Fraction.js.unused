import mongoose, { Schema } from 'mongoose';

const FractionSchema = new Schema(
  {
    name: { type: String, required: true },
    period: { type: String, required: true },
    parties: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
  },
  { timestamps: true },
);

export default mongoose.model('Fraction', FractionSchema);
