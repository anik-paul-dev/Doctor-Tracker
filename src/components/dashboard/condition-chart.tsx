"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConditionDistribution } from "@/types/dashboard";

const CONDITION_PALETTE = [
  "#0F766E", // Teal
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#6366F1", // Indigo
  "#14B8A6", // Cyan
  "#F97316", // Orange
  "#06B6D4", // Sky Blue
  "#84CC16", // Lime
  "#E11D48", // Rose
  "#D946EF", // Fuchsia
  "#A855F7", // Violet
  "#EAB308", // Golden Yellow
  "#0284C7", // Deep Sky
  "#EF4444", // Coral Red
  "#64748B", // Slate
];

interface ConditionChartProps {
  data: ConditionDistribution[];
}

export function ConditionChart({ data }: ConditionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Patients by condition
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Current clinical state across the portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
            No condition data available
          </div>
        ) : (
          <>
            <div className="h-[210px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="condition"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CONDITION_PALETTE[index % CONDITION_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as ConditionDistribution;
                        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-md text-xs">
                            <p className="font-semibold text-popover-foreground">
                              {item.condition}
                            </p>
                            <p className="text-muted-foreground">
                              {item.count} patients ({pct}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-foreground">{total}</span>
                <span className="text-xs text-muted-foreground">patients</span>
              </div>
            </div>

            {/* Bottom Colorful Legend matching screenshot */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 pt-2 border-t border-border/40">
              {data.map((entry, index) => {
                const color = CONDITION_PALETTE[index % CONDITION_PALETTE.length];
                return (
                  <div key={entry.condition} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-muted-foreground">{entry.condition}</span>
                    <span className="font-bold text-foreground">{entry.count}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
