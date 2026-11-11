"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/types/dashboard";

export function useDashboardStats() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to fetch dashboard statistics");
      }
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

