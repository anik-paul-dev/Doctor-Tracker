"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpecializationDistribution } from "@/types/dashboard";

interface SpecializationPieProps {
  data: SpecializationDistribution[];
}

const COLORS = [
  "#0F766E", // Teal
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#6366F1", // Indigo
  "#14B8A6", // Cyan
  "#F97316", // Orange
  "#64748B", // Slate
];

export function SpecializationPie({ data }: SpecializationPieProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Specialization Distribution
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Breakdown of staff doctors by their medical specialty
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No specialization data to display
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-[240px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="specialization"
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as SpecializationDistribution;
                        const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-md text-xs">
                            <p className="font-semibold text-popover-foreground">
                              {item.specialization}
                            </p>
                            <p className="text-muted-foreground">
                              {item.count} doctors ({percent}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="w-full sm:w-1/2 max-h-[220px] overflow-y-auto space-y-1.5 pr-2">
              {data.map((item, index) => {
                const color = COLORS[index % COLORS.length];
                const percent = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate font-medium text-foreground">
                        {item.specialization}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.count}</span>
                      <span className="text-[10px]">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

