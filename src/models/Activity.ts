import mongoose, { Schema, Document } from "mongoose";

export type ActivityActionType = "Created" | "Updated" | "Deleted";

export interface IActivity extends Document {
  type: ActivityActionType;
  userName: string;
  description: string;
  entityType: "doctor" | "patient" | "appointment";
  createdAt: Date;
  seedKey?: string;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: ["Created", "Updated", "Deleted"],
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["doctor", "patient", "appointment"],
      required: true,
      index: true,
    },
    seedKey: { type: String, select: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);
ActivitySchema.index({ seedKey: 1 }, { unique: true, sparse: true });

export default mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

