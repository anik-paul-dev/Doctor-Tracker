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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpecializationDistribution } from "@/types/dashboard";

interface SpecializationBarChartProps {
  data: SpecializationDistribution[];
}

export function SpecializationBarChart({ data }: SpecializationBarChartProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Doctors by specialization
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Coverage across the medical board.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[360px] flex items-center justify-center text-sm text-muted-foreground">
            No specialization data available
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-muted/40"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                  domain={[0, "auto"]}
                />
                <YAxis
                  type="category"
                  dataKey="specialization"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  width={115}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.25)", radius: 4 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-popover p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-popover-foreground mb-1">
                            {label}
                          </p>
                          <p className="text-muted-foreground">
                            Doctors:{" "}
                            <span className="font-bold text-teal-400">
                              {payload[0].value}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#10B981"
                  radius={[4, 4, 4, 4]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

