"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Appointment,
  AppointmentFilters,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/appointment";
import { PaginationMeta } from "@/types/api";

interface AppointmentsResponse {
  appointments: Appointment[];
  pagination: PaginationMeta;
}

export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery<AppointmentsResponse>({
    queryKey: ["appointments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.search) params.set("search", filters.search);
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.doctorId) params.set("doctorId", filters.doctorId);
      if (filters.patientId) params.set("patientId", filters.patientId);
      if (filters.date) params.set("date", filters.date);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await res.json();
      return data.data;
    },
  });
}

export function useAppointment(id: string) {
  return useQuery<Appointment>({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch appointment");
      }
      const data = await res.json();
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAppointmentInput;
    }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
