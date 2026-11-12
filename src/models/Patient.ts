import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPatient extends Document {
  doctorId: Types.ObjectId;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  seedKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    notes: {
      type: String,
    },
    seedKey: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
PatientSchema.index({ name: "text", condition: "text" });
PatientSchema.index({ doctorId: 1, createdAt: -1 });
PatientSchema.index({ condition: 1, createdAt: -1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ seedKey: 1 }, { unique: true, sparse: true });

const Patient =
  mongoose.models.Patient ||
  mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
