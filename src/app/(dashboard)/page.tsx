"use client";

import React from "react";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DoctorChart } from "@/components/dashboard/doctor-chart";
import { PatientTrendChart } from "@/components/dashboard/patient-trend-chart";
import { SpecializationPie } from "@/components/dashboard/specialization-pie";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  StatsCardsSkeleton,
  ChartSkeleton,
} from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Stethoscope, UserPlus, RefreshCw, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Clinical Operations Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time practitioner allocations, patient admission metrics, and caseload distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Link href="/doctors">
            <Button size="sm" className="h-9 text-xs font-semibold">
              <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
              Manage Doctors
            </Button>
          </Link>
          <Link href="/patients">
            <Button size="sm" variant="secondary" className="h-9 text-xs font-semibold">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load real-time analytics. Please check database connectivity.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-destructive/30 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 Stats Cards */}
      {isLoading ? (
        <StatsCardsSkeleton />
      ) : data?.stats ? (
        <StatsCards stats={data.stats} />
      ) : null}

      {/* Middle Visuals: Trends & Specialization Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <PatientTrendChart data={data?.monthlyTrend || []} />
            <SpecializationPie
              data={data?.specializationDistribution || []}
            />
          </>
        )}
      </div>

      {/* Full Width Bar Chart: Top Doctors by Patient Count */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <DoctorChart data={data?.patientsPerDoctor || []} />
      )}

      {/* Recent Activity Feed */}
      {isLoading ? (
        <div className="h-40 rounded-xl border bg-card animate-pulse" />
      ) : (
        <RecentActivity activities={data?.recentActivity || []} />
      )}
    </div>
  );
}

