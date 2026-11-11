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
import { Gauge } from "lucide-react";
import type { GenderDistribution } from "@/types/dashboard";

const GENDER_COLORS: Record<string, string> = {
  male: "#14B8A6",
  Male: "#14B8A6",
  female: "#F97316",
  Female: "#F97316",
  other: "#A855F7",
  Other: "#A855F7",
};

const DEFAULT_COLOR = "#94A3B8";

function capitalizeGender(g: string) {
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
}

interface DemographicsChartProps {
  data: GenderDistribution[];
  averageAge: number;
}

export function DemographicsChart({ data, averageAge }: DemographicsChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Patient demographics
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Gender mix across the portal.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-xs font-medium text-muted-foreground">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Avg age <strong className="text-foreground">{averageAge}</strong> yrs</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
            No demographics data available
          </div>
        ) : (
          <>
            <div className="h-[210px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GENDER_COLORS[entry.gender] || DEFAULT_COLOR}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as GenderDistribution;
                        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-md text-xs">
                            <p className="font-semibold text-popover-foreground">
                              {capitalizeGender(item.gender)}
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

            {/* Bottom Legend */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-3 pt-2 border-t border-border/40">
              {data.map((entry) => (
                <div key={entry.gender} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: GENDER_COLORS[entry.gender] || DEFAULT_COLOR,
                    }}
                  />
                  <span className="text-muted-foreground">{capitalizeGender(entry.gender)}</span>
                  <span className="font-semibold text-foreground">{entry.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

