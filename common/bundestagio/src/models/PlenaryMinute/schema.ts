import { Schema, Document, SchemaTimestampsConfig } from 'mongoose';

export interface IPlenaryMinute {
  date: Date;
  meeting: number;
  period: number;
  xml: string;
}

export type PlenaryMinuteDoc = IPlenaryMinute & Document & SchemaTimestampsConfig;

const PlenaryMinuteSchema = new Schema<PlenaryMinuteDoc>(
  {
    date: { type: Date, required: true, unique: true },
    meeting: { type: Number, required: true, unique: false },
    period: { type: Number, required: true, unique: false },
    xml: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);
PlenaryMinuteSchema.index(
  {
    meeting: 1,
    period: 1,
  },
  { unique: true },
);

export default PlenaryMinuteSchema;
