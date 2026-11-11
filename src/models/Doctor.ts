import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },
    hospital: {
      type: String,
      required: [true, "Hospital is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    patientCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DoctorSchema.index({ name: "text", specialization: "text", hospital: "text" });
DoctorSchema.index({ specialization: 1, createdAt: -1 });
DoctorSchema.index({ hospital: 1, createdAt: -1 });
DoctorSchema.index({ createdAt: -1 });

const Doctor =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
