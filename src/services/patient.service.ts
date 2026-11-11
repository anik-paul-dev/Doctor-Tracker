import mongoose, { FilterQuery, SortOrder, Types } from "mongoose";
import connectDB from "@/lib/db";
import Patient, { IPatient } from "@/models/Patient";
import Doctor from "@/models/Doctor";
import { PatientQuery } from "@/lib/validations";

export async function getPatients(query: PatientQuery) {
  await connectDB();

  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    condition,
    doctorId,
    startDate,
    endDate,
  } = query;

  const filter: FilterQuery<IPatient> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { condition: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (condition) {
    filter.condition = condition;
  }

  if (doctorId) {
    filter.doctorId = doctorId;
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

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctorId", "name specialization")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return { patients, total };
}

export async function getPatientsByDoctor(
  doctorId: string,
  query: Partial<PatientQuery> = {}
) {
  await connectDB();

  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    condition,
    startDate,
    endDate,
  } = query;

  const filter: FilterQuery<IPatient> = { doctorId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { condition: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (condition) {
    filter.condition = condition;
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

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctorId", "name specialization")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return { patients, total };
}

export async function getPatientById(id: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Patient.findById(id)
    .populate("doctorId", "name specialization")
    .lean();
}

export async function createPatient(
  data: {
    doctorId: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    condition: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }
) {
  await connectDB();

  const patientData = {
    ...data,
    doctorId: new Types.ObjectId(data.doctorId),
  };

  const patient = await Patient.create(patientData);

  // Increment doctor's patientCount
  await Doctor.findByIdAndUpdate(data.doctorId, {
    $inc: { patientCount: 1 },
  });

  return patient.toObject();
}

export async function updatePatient(id: string, data: Partial<IPatient>) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Patient.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
}

export async function deletePatient(id: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const patient = await Patient.findByIdAndDelete(id).lean() as (IPatient & { _id: mongoose.Types.ObjectId }) | null;

  if (patient) {
    // Decrement doctor's patientCount
    await Doctor.findByIdAndUpdate(patient.doctorId, {
      $inc: { patientCount: -1 },
    });
  }

  return patient;
}
