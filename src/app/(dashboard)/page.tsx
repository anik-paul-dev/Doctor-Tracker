"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { ClinicHealth } from "@/components/dashboard/clinic-health";
import { SmartInsights } from "@/components/dashboard/smart-insights";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { LiveActivity } from "@/components/dashboard/live-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopDoctorsRoster } from "@/components/dashboard/top-doctors-roster";
import { RecentAdmissions } from "@/components/dashboard/recent-admissions";
import {
  StatsCardsSkeleton,
  ChartSkeleton,
} from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Stethoscope, UserPlus, RefreshCw, AlertCircle, Search, Calendar } from "lucide-react";

const PatientTrendChart = dynamic(
  () => import("@/components/dashboard/patient-trend-chart").then((module) => module.PatientTrendChart),
  { loading: () => <ChartSkeleton /> }
);
const ConditionChart = dynamic(
  () => import("@/components/dashboard/condition-chart").then((module) => module.ConditionChart),
  { loading: () => <ChartSkeleton /> }
);
const DemographicsChart = dynamic(
  () => import("@/components/dashboard/demographics-chart").then((module) => module.DemographicsChart),
  { loading: () => <ChartSkeleton /> }
);
const SpecializationBarChart = dynamic(
  () => import("@/components/dashboard/specialization-bar-chart").then((module) => module.SpecializationBarChart),
  { loading: () => <ChartSkeleton /> }
);

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Button matching image */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-search"))}
            className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all cursor-pointer text-xs"
            title="Search (Ctrl + K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              Ctrl K
            </kbd>
          </button>

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
          <Link href="/appointments">
            <Button size="sm" variant="outline" className="h-9 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Appointments
            </Button>
          </Link>
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

      {/* Section 0: Clinic Health & Smart Insights (Matching Image 1 & Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ClinicHealth data={data?.clinicHealth} />
            <SmartInsights items={data?.smartInsights} />
          </>
        )}
      </div>

      {/* 4 Stats Cards */}
      {isLoading ? (
        <StatsCardsSkeleton />
      ) : data?.stats ? (
        <StatsCards stats={data.stats} />
      ) : null}

      {/* Section 1: Patient Admissions Trend (with 7d / 14d / 30d filter) */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <PatientTrendChart
          monthlyData={data?.monthlyTrend || []}
          data7={data?.admissionTrend7 || []}
          data14={data?.admissionTrend14 || []}
          data30={data?.admissionTrend30 || []}
        />
      )}

      {/* Section 2: Patients by Condition & Patient Demographics (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ConditionChart data={data?.conditionDistribution || []} />
            <DemographicsChart
              data={data?.genderDistribution || []}
              averageAge={data?.averageAge || 0}
            />
          </>
        )}
      </div>

      {/* Section 3: Today's Schedule & Live Activity (Side by Side matching Image 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <TodaySchedule items={data?.todaySchedule} />
            <LiveActivity items={data?.liveActivities} />
          </>
        )}
      </div>

      {/* Section 4: Top Doctors by Roster & Doctors by Specialization (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <TopDoctorsRoster data={data?.patientsPerDoctor || []} />
            <SpecializationBarChart
              data={data?.specializationDistribution || []}
            />
          </>
        )}
      </div>

      {/* Section 5: Recent Admissions (Latest patients added to rosters) */}
      {isLoading ? (
        <div className="h-40 rounded-xl border bg-card animate-pulse" />
      ) : (
        <RecentAdmissions data={data?.recentAdmissions || []} />
      )}
    </div>
  );
}
