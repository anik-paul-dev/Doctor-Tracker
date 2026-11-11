"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdmissionTrend, MonthlyTrend } from "@/types/dashboard";

type Range = "7d" | "14d" | "30d";

export interface PatientTrendChartProps {
  monthlyData?: MonthlyTrend[];
  data7?: AdmissionTrend[];
  data14?: AdmissionTrend[];
  data30?: AdmissionTrend[];
}

export function PatientTrendChart({
  monthlyData = [],
  data7 = [],
  data14 = [],
  data30 = [],
}: PatientTrendChartProps) {
  const [range, setRange] = useState<Range>("30d");

  const getChartData = () => {
    if (range === "7d") {
      const src = data7.length > 0 ? data7 : data30.slice(-7);
      if (src.length > 0) {
        return src.map((d) => ({ label: d.date, patients: d.patients, doctors: d.doctors }));
      }
    }
    if (range === "14d") {
      const src = data14.length > 0 ? data14 : data30.slice(-14);
      if (src.length > 0) {
        return src.map((d) => ({ label: d.date, patients: d.patients, doctors: d.doctors }));
      }
    }
    if (data30.length > 0) {
      return data30.map((d) => ({ label: d.date, patients: d.patients, doctors: d.doctors }));
    }
    return monthlyData.map((d) => ({ label: d.month, patients: d.patients, doctors: d.doctors }));
  };

  const chartData = getChartData();

  const ranges: { value: Range; label: string }[] = [
    { value: "7d", label: "7d" },
    { value: "14d", label: "14d" },
    { value: "30d", label: "30d" },
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-400 shrink-0" />
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Patient admissions
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            New admissions versus new doctors joining — last {range === "7d" ? "7" : range === "14d" ? "14" : "30"} days.
          </CardDescription>

          {/* 7d / 14d / 30d Segmented Filter */}
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 w-fit mt-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  range === r.value
                    ? "bg-accent text-accent-foreground border border-border shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No historical registration data available
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-popover p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-popover-foreground mb-1.5">
                            {label}
                          </p>
                          {payload.map((entry, index) => (
                            <p
                              key={index}
                              className="flex items-center gap-2 font-medium"
                              style={{ color: entry.color }}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="capitalize">{entry.name}:</span>
                              <span>{entry.value}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                />
                <Area
                  type="monotone"
                  dataKey="doctors"
                  name="Doctors"
                  stroke="#0F766E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDoctors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
