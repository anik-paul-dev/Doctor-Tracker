import mongoose, { FilterQuery, SortOrder } from "mongoose";
import connectDB from "@/lib/db";
import Doctor, { IDoctor } from "@/models/Doctor";
import Patient from "@/models/Patient";
import { DoctorQuery } from "@/lib/validations";

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

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
      { hospital: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
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
      filter.createdAt.$lte = new Date(endDate);
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
  data: Omit<IDoctor, keyof mongoose.Document | "patientCount" | "createdAt" | "updatedAt">
) {
  await connectDB();

  const doctor = await Doctor.create(data);
  return doctor.toObject();
}

export async function updateDoctor(id: string, data: Partial<IDoctor>) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

export async function deleteDoctor(id: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  // Delete all patients belonging to this doctor
  await Patient.deleteMany({ doctorId: id });

  return Doctor.findByIdAndDelete(id).lean();
}

export async function getUniqueHospitals() {
  await connectDB();

  return Doctor.distinct("hospital");
}
