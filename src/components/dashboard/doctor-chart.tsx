"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientsPerDoctor } from "@/types/dashboard";

interface DoctorChartProps {
  data: PatientsPerDoctor[];
}

export function DoctorChart({ data }: DoctorChartProps) {
  const chartData = data.slice(0, 8).map((d) => ({
    name: d.doctorName.length > 14 ? `${d.doctorName.slice(0, 12)}...` : d.doctorName,
    fullName: d.doctorName,
    patients: d.patientCount,
  }));

  return (
    <Card className="col-span-full border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Top Doctors by Assigned Patients
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Comparison of clinical patient loads among the highest-volume doctors
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No doctor data available to display
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-popover p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-popover-foreground mb-1">
                            {item.fullName}
                          </p>
                          <p className="text-primary font-medium">
                            {item.patients} {item.patients === 1 ? "Patient" : "Patients"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="patients"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

