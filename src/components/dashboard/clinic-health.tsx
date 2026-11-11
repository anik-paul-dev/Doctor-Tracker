"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, Calendar, CalendarCheck } from "lucide-react";
import type { ClinicHealth as ClinicHealthType } from "@/types/dashboard";

interface ClinicHealthProps {
  data?: ClinicHealthType;
}

export function ClinicHealth({ data }: ClinicHealthProps) {
  const score = data?.score ?? 61;
  const status = data?.status ?? "Needs attention";
  const critical = data?.criticalPatients ?? 8;
  const todayAppts = data?.appointmentsToday ?? 5;
  const upcomingThisWeek = data?.upcomingThisWeek ?? 17;

  // Arc calculation for semi-circle gauge (radius = 70, strokeWidth = 14)
  // Arc length = PI * radius = 3.14159 * 70 = 219.9
  const progress = Math.min(100, Math.max(0, score)) / 100;

  return (
    <Card className="border shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-400 shrink-0" />
          <CardTitle className="text-base font-semibold text-foreground">
            Clinic Health
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Composite score across acuity, workload and cancellations.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-6 flex flex-col items-center justify-between flex-1">
        {/* Semi-circular Gauge */}
        <div className="relative w-[220px] h-[130px] flex items-center justify-center mt-2">
          <svg className="w-[220px] h-[130px] overflow-visible" viewBox="0 0 200 120">
            {/* Background Track Arc */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Colored Progress Arc */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={235.6}
              strokeDashoffset={235.6 * (1 - progress)}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center text inside Arc */}
          <div className="absolute top-[38px] flex flex-col items-center pointer-events-none">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              {score}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium -mt-1">
              out of 100
            </span>
            <span className="text-xs font-bold text-amber-400 mt-1">
              {status}
            </span>
          </div>
        </div>

        {/* Bottom 3 metrics matching image */}
        <div className="grid grid-cols-3 w-full gap-2 pt-6 mt-4 border-t border-border/40 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-4 w-4 text-rose-400 mb-1" />
            <span className="text-base font-bold text-foreground">{critical}</span>
            <span className="text-[11px] text-muted-foreground font-medium">Critical</span>
          </div>
          <div className="flex flex-col items-center">
            <Calendar className="h-4 w-4 text-teal-400 mb-1" />
            <span className="text-base font-bold text-foreground">{todayAppts}</span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Appointments today
            </span>
          </div>
          <div className="flex flex-col items-center">
            <CalendarCheck className="h-4 w-4 text-emerald-400 mb-1" />
            <span className="text-base font-bold text-foreground">{upcomingThisWeek}</span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Upcoming this week
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
