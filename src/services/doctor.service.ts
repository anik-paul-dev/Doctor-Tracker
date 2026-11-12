import mongoose, { FilterQuery, SortOrder } from "mongoose";
import connectDB from "@/lib/db";
import Doctor, { IDoctor } from "@/models/Doctor";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import Activity from "@/models/Activity";
import { DoctorQuery } from "@/lib/validations";

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getDoctors(query: DoctorQuery) {
  await connectDB();

  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    specialization,
    hospital,
    startDate,
    endDate,
  } = query;

  const filter: FilterQuery<IDoctor> = {};

  if (search && search.trim()) {
    const safe = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { specialization: { $regex: safe, $options: "i" } },
      { hospital: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
      { phone: { $regex: safe, $options: "i" } },
    ];
  }

  if (specialization) {
    filter.specialization = specialization;
  }

  if (hospital) {
    filter.hospital = hospital;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  return { doctors, total };
}

export async function getDoctorById(id: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Doctor.findById(id).lean();
}

export async function createDoctor(
  data: Omit<IDoctor, keyof mongoose.Document | "patientCount" | "createdAt" | "updatedAt">,
  userName: string
) {
  await connectDB();

  const doctor = await Doctor.create(data);
  await Activity.create({ type: "Created", userName, description: "Created a doctor record", entityType: "doctor" }).catch(() => null);
  return doctor.toObject();
}

export async function updateDoctor(id: string, data: Partial<IDoctor>, userName: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (doctor) {
    await Activity.create({ type: "Updated", userName, description: "Updated a doctor record", entityType: "doctor" }).catch(() => null);
  }
  return doctor;
}

export async function deleteDoctor(id: string, userName: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  // Delete all patients belonging to this doctor
  await Patient.deleteMany({ doctorId: id });
  await Appointment.deleteMany({ doctorId: id });

  const doctor = await Doctor.findByIdAndDelete(id).lean();
  if (doctor) {
    await Activity.create({ type: "Deleted", userName, description: "Deleted a doctor record", entityType: "doctor" }).catch(() => null);
  }
  return doctor;
}

export async function getUniqueHospitals() {
  await connectDB();

  return Doctor.distinct("hospital");
}
