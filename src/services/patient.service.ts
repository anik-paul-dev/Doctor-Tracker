import mongoose, { FilterQuery, SortOrder, Types } from "mongoose";
import connectDB from "@/lib/db";
import Patient, { IPatient } from "@/models/Patient";
import Doctor from "@/models/Doctor";
import { PatientQuery } from "@/lib/validations";

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

  if (search && search.trim()) {
    const safe = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { condition: { $regex: safe, $options: "i" } },
      { phone: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
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
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
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

  if (search && search.trim()) {
    const safe = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { condition: { $regex: safe, $options: "i" } },
      { phone: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
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
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
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

  // If doctorId is being updated and changed, synchronize patient counts
  if (data.doctorId) {
    const existing = (await Patient.findById(id).lean()) as (IPatient & { _id: Types.ObjectId }) | null;
    if (existing && existing.doctorId && existing.doctorId.toString() !== data.doctorId.toString()) {
      await Promise.all([
        Doctor.findByIdAndUpdate(existing.doctorId, { $inc: { patientCount: -1 } }),
        Doctor.findByIdAndUpdate(data.doctorId, { $inc: { patientCount: 1 } }),
      ]);
    }
  }

  return Patient.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("doctorId", "name specialization")
    .lean();
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
