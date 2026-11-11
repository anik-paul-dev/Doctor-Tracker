import connectDB from "@/lib/db";
import Appointment, { AppointmentStatus } from "@/models/Appointment";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Activity from "@/models/Activity";
import { AppointmentQuery, CreateAppointmentInput, UpdateAppointmentInput } from "@/lib/validations";

interface RawAppointment {
  _id: unknown;
  patientId: { _id?: unknown; name?: string; condition?: string } | unknown;
  doctorId: { _id?: unknown; name?: string; specialization?: string; hospital?: string } | unknown;
  date: string;
  time: string;
  duration: number;
  reason: string;
  room: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NamedEntity {
  _id?: unknown;
  name?: string;
}

export async function getAppointments(query: AppointmentQuery) {
  await connectDB();

  const {
    page = 1,
    limit = 10,
    search,
    status,
    doctorId,
    patientId,
    date,
    startDate,
    endDate,
    sortBy = "date",
    sortOrder = "asc",
  } = query;

  const filter: Record<string, unknown> = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (doctorId) {
    filter.doctorId = doctorId;
  }

  if (patientId) {
    filter.patientId = patientId;
  }

  if (date) {
    filter.date = date;
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) (filter.date as Record<string, string>).$gte = startDate;
    if (endDate) (filter.date as Record<string, string>).$lte = endDate;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    // Find matching doctors or patients
    const [matchingDoctors, matchingPatients] = await Promise.all([
      Doctor.find({ name: searchRegex }).select("_id").lean(),
      Patient.find({ name: searchRegex }).select("_id").lean(),
    ]);

    const doctorIds = matchingDoctors.map((d) => d._id);
    const patientIds = matchingPatients.map((p) => p._id);

    filter.$or = [
      { reason: searchRegex },
      { room: searchRegex },
      { doctorId: { $in: doctorIds } },
      { patientId: { $in: patientIds } },
    ];
  }

  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = {
    [sortBy]: sortDirection,
  };
  if (sortBy === "date") {
    sortOptions.time = 1;
  }

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patientId", "name condition phone email")
      .populate("doctorId", "name specialization hospital")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  return {
    appointments: appointments.map((a) => {
      const p = a.patientId as { _id?: unknown; name?: string; condition?: string } | null;
      const d = a.doctorId as { _id?: unknown; name?: string; specialization?: string; hospital?: string } | null;
      return {
        _id: String(a._id),
        patientId: p?._id ? String(p._id) : String(a.patientId),
        doctorId: d?._id ? String(d._id) : String(a.doctorId),
        patientName: p?.name || "Unknown Patient",
        patientCondition: p?.condition || "Stable",
        doctorName: d?.name || "Unknown Doctor",
        doctorSpecialization: d?.specialization || "General Practice",
        date: a.date,
        time: a.time,
        duration: a.duration,
        reason: a.reason,
        room: a.room,
        status: a.status as AppointmentStatus,
        notes: a.notes,
        createdAt: a.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: a.updatedAt?.toISOString() || new Date().toISOString(),
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
}

export async function getAppointmentById(id: string) {
  await connectDB();
  const appointment = (await Appointment.findById(id)
    .populate("patientId", "name condition phone email")
    .populate("doctorId", "name specialization hospital")
    .lean()) as unknown as RawAppointment | null;

  if (!appointment) return null;

  const p = appointment.patientId as { _id?: unknown; name?: string; condition?: string } | null;
  const d = appointment.doctorId as { _id?: unknown; name?: string; specialization?: string; hospital?: string } | null;

  return {
    _id: String(appointment._id),
    patientId: p?._id ? String(p._id) : String(appointment.patientId),
    doctorId: d?._id ? String(d._id) : String(appointment.doctorId),
    patientName: p?.name || "Unknown Patient",
    patientCondition: p?.condition || "Stable",
    doctorName: d?.name || "Unknown Doctor",
    doctorSpecialization: d?.specialization || "General Practice",
    date: appointment.date,
    time: appointment.time,
    duration: appointment.duration,
    reason: appointment.reason,
    room: appointment.room,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: appointment.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function createAppointment(data: CreateAppointmentInput, userName: string = "Alex Morgan") {
  await connectDB();

  const appointment = await Appointment.create(data);

  // Retrieve names for logging
  const [patient, doctor] = (await Promise.all([
    Patient.findById(data.patientId).select("name").lean(),
    Doctor.findById(data.doctorId).select("name").lean(),
  ])) as unknown as [NamedEntity | null, NamedEntity | null];

  const pName = patient?.name || "patient";
  const dName = doctor?.name || "doctor";

  // Log activity
  await Activity.create({
    type: "Created",
    userName,
    description: `Booked appointment for ${pName} with ${dName} (${data.time})`,
    entityType: "appointment",
  }).catch(() => null);

  return getAppointmentById(String(appointment._id));
}

export async function updateAppointment(id: string, data: UpdateAppointmentInput, userName: string = "Alex Morgan") {
  await connectDB();

  const updated = (await Appointment.findByIdAndUpdate(id, data, { new: true })) as unknown as RawAppointment | null;
  if (!updated) return null;

  const [patient, doctor] = (await Promise.all([
    Patient.findById(updated.patientId).select("name").lean(),
    Doctor.findById(updated.doctorId).select("name").lean(),
  ])) as unknown as [NamedEntity | null, NamedEntity | null];

  const pName = patient?.name || "patient";
  const dName = doctor?.name || "doctor";

  let actionDesc = `Updated appointment for ${pName} with ${dName}`;
  if (data.status === "cancelled") {
    actionDesc = `Cancelled the appointment of ${pName} with ${dName}`;
  } else if (data.status === "completed") {
    actionDesc = `Completed consultation for ${pName} with ${dName}`;
  }

  await Activity.create({
    type: data.status === "cancelled" ? "Deleted" : "Updated",
    userName,
    description: actionDesc,
    entityType: "appointment",
  }).catch(() => null);

  return getAppointmentById(id);
}

export async function deleteAppointment(id: string, userName: string = "Alex Morgan") {
  await connectDB();

  const appointment = (await Appointment.findById(id)) as unknown as RawAppointment | null;
  if (!appointment) return null;

  const [patient, doctor] = (await Promise.all([
    Patient.findById(appointment.patientId).select("name").lean(),
    Doctor.findById(appointment.doctorId).select("name").lean(),
  ])) as unknown as [NamedEntity | null, NamedEntity | null];

  await Appointment.findByIdAndDelete(id);

  const pName = patient?.name || "patient";
  const dName = doctor?.name || "doctor";

  await Activity.create({
    type: "Deleted",
    userName,
    description: `Removed appointment for ${pName} with ${dName}`,
    entityType: "appointment",
  }).catch(() => null);

  return true;
}

export async function getTodayAppointments() {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);

  // Return today's appointments sorted by time
  const appointments = await Appointment.find({ date: today })
    .populate("patientId", "name condition")
    .populate("doctorId", "name specialization")
    .sort({ time: 1 })
    .lean();

  return appointments.map((a) => {
    const p = a.patientId as { name?: string; condition?: string } | null;
    const d = a.doctorId as { name?: string; specialization?: string } | null;
    return {
      id: String(a._id),
      time: a.time,
      patientName: p?.name || "Unknown Patient",
      doctorName: d?.name || "Unknown Doctor",
      room: a.room,
      status: a.status as AppointmentStatus,
    };
  });
}
