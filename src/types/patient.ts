export interface Patient {
  _id: string;
  doctorId: string | { _id: string; name: string; specialization: string };
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientPayload {
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

export type UpdatePatientPayload = Partial<Omit<CreatePatientPayload, "doctorId">>;

export interface PatientFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  condition?: string;
  doctorId?: string;
}

