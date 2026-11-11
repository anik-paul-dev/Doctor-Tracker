"use client";

import React from "react";
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
import { MonthlyTrend } from "@/types/dashboard";

interface PatientTrendChartProps {
  data: MonthlyTrend[];
}

export function PatientTrendChart({ data }: PatientTrendChartProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Monthly Registration Trends
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          New doctors vs. new patients registered over the past 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No historical registration data available
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
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
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
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

