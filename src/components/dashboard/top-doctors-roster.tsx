"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { PatientsPerDoctor } from "@/types/dashboard";

interface TopDoctorsRosterProps {
  data: PatientsPerDoctor[];
}

export function TopDoctorsRoster({ data }: TopDoctorsRosterProps) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.patientCount)) : 1;

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-teal-400 shrink-0" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Top doctors by roster
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ranked by patients currently assigned.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No doctor data available
          </div>
        ) : (
          <div className="space-y-3.5">
            {data.slice(0, 8).map((doc, i) => {
              const pct = maxCount > 0 ? (doc.patientCount / maxCount) * 100 : 0;
              return (
                <div key={doc.doctorName + i} className="flex items-center gap-3">
                  {/* Rank */}
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold text-teal-400 bg-teal-950/40 border border-teal-800/40">
                    {i + 1}
                  </span>
                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 font-bold text-xs shadow-2xs">
                    {getInitials(doc.doctorName)}
                  </div>
                  {/* Middle: Doctor Name + Progress bar below */}
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-sm font-semibold text-foreground truncate block">
                      {doc.doctorName}
                    </span>
                    <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {/* Right side: Count on top, Specialization on bottom */}
                  <div className="flex flex-col items-end shrink-0 text-right">
                    <span className="text-xs font-semibold text-foreground">
                      {doc.patientCount} patients
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {doc.specialization || "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

