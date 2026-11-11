import mongoose, { Schema, Document, Types } from "mongoose";

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "06:30 PM" or "18:30"
  duration: number; // in minutes (15, 30, 45, 60)
  reason: string;
  room: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      index: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    duration: {
      type: Number,
      default: 45,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    room: {
      type: String,
      required: [true, "Room is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

