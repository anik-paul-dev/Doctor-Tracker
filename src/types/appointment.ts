import { AppointmentStatus } from "@/models/Appointment";

export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    condition: string;
  } | string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
    hospital?: string;
  } | string;
  patientName?: string;
  patientCondition?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "06:30 PM"
  duration: number; // minutes
  reason: string;
  room: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus | "all";
  doctorId?: string;
  patientId?: string;
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration?: number;
  reason: string;
  room: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentInput {
  patientId?: string;
  doctorId?: string;
  date?: string;
  time?: string;
  duration?: number;
  reason?: string;
  room?: string;
  status?: AppointmentStatus;
  notes?: string;
}

