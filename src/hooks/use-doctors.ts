"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Doctor, CreateDoctorPayload, UpdateDoctorPayload, DoctorFilters } from "@/types/doctor";
import { Patient, PatientFilters } from "@/types/patient";
import { PaginationMeta } from "@/types/api";
import { toast } from "sonner";

interface DoctorsResponse {
  doctors: Doctor[];
  pagination: PaginationMeta;
}

interface DoctorPatientsResponse {
  patients: Patient[];
  pagination: PaginationMeta;
}

export function useDoctors(filters: DoctorFilters = {}) {
  return useQuery<DoctorsResponse>({
    queryKey: ["doctors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.search) params.set("search", filters.search);
      if (filters.specialization) params.set("specialization", filters.specialization);
      if (filters.hospital) params.set("hospital", filters.hospital);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to fetch doctors");
      }
      return {
        doctors: json.data,
        pagination: json.pagination,
      };
    },
  });
}

export function useDoctor(id: string) {
  return useQuery<Doctor>({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const res = await fetch(`/api/doctors/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Doctor not found");
      }
      return json.data;
    },
    enabled: !!id,
  });
}

export function useDoctorPatients(doctorId: string, filters: PatientFilters = {}) {
  return useQuery<DoctorPatientsResponse>({
    queryKey: ["doctor-patients", doctorId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.search) params.set("search", filters.search);
      if (filters.condition) params.set("condition", filters.condition);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const res = await fetch(`/api/doctors/${doctorId}/patients?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to fetch doctor's patients");
      }
      return {
        patients: json.data,
        pagination: json.pagination,
      };
    },
    enabled: !!doctorId,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDoctorPayload) => {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to create doctor");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Doctor created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDoctorPayload }) => {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update doctor");
      }
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Doctor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete doctor");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Doctor and related records removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

