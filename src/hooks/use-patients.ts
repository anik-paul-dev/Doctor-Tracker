"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient, CreatePatientPayload, UpdatePatientPayload, PatientFilters } from "@/types/patient";
import { PaginationMeta } from "@/types/api";
import { toast } from "sonner";

interface PatientsResponse {
  patients: Patient[];
  pagination: PaginationMeta;
}

export function usePatients(filters: PatientFilters = {}) {
  return useQuery<PatientsResponse>({
    queryKey: ["patients", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.search) params.set("search", filters.search);
      if (filters.condition) params.set("condition", filters.condition);
      if (filters.doctorId) params.set("doctorId", filters.doctorId);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const res = await fetch(`/api/patients?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to fetch patients");
      }
      return {
        patients: json.data,
        pagination: json.pagination,
      };
    },
  });
}

export function usePatient(id: string) {
  return useQuery<Patient>({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Patient not found");
      }
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePatientPayload) => {
      const res = await fetch(`/api/doctors/${payload.doctorId}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to add patient");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Patient created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePatientPayload }) => {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update patient");
      }
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Patient updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete patient");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Patient deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

