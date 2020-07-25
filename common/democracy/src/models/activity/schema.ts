import mongoose, { Schema, Document, Types } from "mongoose";
import { Timestamps } from "../timestamp";
import { User } from "../user";
import { IProcedure } from "../procedure";

export interface Activity extends Document, Timestamps {
  kind: string;
  actor: User | Types.ObjectId;
  procedure: IProcedure | Types.ObjectId;
}

const ActivitySchema = new Schema<Activity>(
  {
    kind: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, refPath: "kind", required: true },
    procedure: {
      type: Schema.Types.ObjectId,
      ref: "Procedure",
      required: true,
    },
  },
  { timestamps: false }
);

ActivitySchema.index({ actor: 1, procedure: 1 }, { unique: true });
ActivitySchema.index({ procedure: 1, kind: 1 });

ActivitySchema.post<Activity>("save", async (doc) => {
  const activities = await mongoose
    .model("Activity")
    .find({ procedure: doc.procedure, kind: "Phone" })
    .count();
  await mongoose
    .model("Procedure")
    .findByIdAndUpdate(doc.procedure, { activities });
});

export default ActivitySchema;
