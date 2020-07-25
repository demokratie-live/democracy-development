import { Schema, Document, SchemaTimestampsConfig } from "mongoose";

export interface IPlenaryMinute {
  date: Date;
  meeting: number;
  xml: string;
}

export type PlenaryMinuteDoc = IPlenaryMinute &
  Document &
  SchemaTimestampsConfig;

const PlenaryMinuteSchema = new Schema<PlenaryMinuteDoc>(
  {
    date: { type: Date, required: true, unique: true },
    meeting: { type: Number, required: true, unique: true },
    xml: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default PlenaryMinuteSchema;
