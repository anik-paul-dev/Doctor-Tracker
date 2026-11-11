import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

// Doctor schemas
export const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  specialization: z.string().min(2, "Specialization is required").max(100),
  hospital: z.string().min(2, "Hospital is required").max(200),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20),
  email: z.string().email("Invalid email address"),
});

export const updateDoctorSchema = createDoctorSchema.partial();

// Patient schemas
export const createPatientSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.number().int().min(0, "Age must be positive").max(150),
  gender: z.enum(["male", "female", "other"]),
  condition: z.string().min(2, "Condition is required").max(200),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const updatePatientSchema = createPatientSchema.omit({ doctorId: true }).partial();

// Appointment schemas
export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.coerce.number().min(15).max(120).default(45),
  reason: z.string().min(2, "Reason is required").max(200),
  room: z.string().min(1, "Room is required").max(100),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]).default("scheduled"),
  notes: z.string().max(500).optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

// Query schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const doctorQuerySchema = paginationSchema.extend({
  specialization: z.string().optional(),
  hospital: z.string().optional(),
});

export const patientQuerySchema = paginationSchema.extend({
  condition: z.string().optional(),
  doctorId: z.string().optional(),
});

export const appointmentQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  date: z.string().optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type DoctorQuery = z.infer<typeof doctorQuerySchema>;
export type PatientQuery = z.infer<typeof patientQuerySchema>;
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;
