"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { RecentAdmission } from "@/types/dashboard";

const BADGE_COLOR_PALETTES = [
  { badge: "bg-amber-950/50 text-amber-300 border-amber-800/60", dot: "bg-amber-400" },
  { badge: "bg-rose-950/50 text-rose-300 border-rose-800/60", dot: "bg-rose-400" },
  { badge: "bg-sky-950/50 text-sky-300 border-sky-800/60", dot: "bg-sky-400" },
  { badge: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60", dot: "bg-emerald-400" },
  { badge: "bg-purple-950/50 text-purple-300 border-purple-800/60", dot: "bg-purple-400" },
  { badge: "bg-teal-950/50 text-teal-300 border-teal-800/60", dot: "bg-teal-400" },
  { badge: "bg-indigo-950/50 text-indigo-300 border-indigo-800/60", dot: "bg-indigo-400" },
  { badge: "bg-orange-950/50 text-orange-300 border-orange-800/60", dot: "bg-orange-400" },
  { badge: "bg-cyan-950/50 text-cyan-300 border-cyan-800/60", dot: "bg-cyan-400" },
  { badge: "bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-800/60", dot: "bg-fuchsia-400" },
];

const KNOWN_CONDITION_STYLES: Record<string, { badge: string; dot: string }> = {
  Critical: { badge: "bg-rose-950/60 text-rose-300 border-rose-800/70", dot: "bg-rose-400" },
  Serious: { badge: "bg-amber-950/60 text-amber-300 border-amber-800/70", dot: "bg-amber-400" },
  Stable: { badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/70", dot: "bg-emerald-400" },
  Recovering: { badge: "bg-teal-950/60 text-teal-300 border-teal-800/70", dot: "bg-teal-400" },
  Arthritis: { badge: "bg-amber-950/50 text-amber-300 border-amber-800/60", dot: "bg-amber-400" },
  "Chronic Pain": { badge: "bg-rose-950/50 text-rose-300 border-rose-800/60", dot: "bg-rose-400" },
  "Kidney Disease": { badge: "bg-sky-950/50 text-sky-300 border-sky-800/60", dot: "bg-sky-400" },
  "Heart Disease": { badge: "bg-red-950/50 text-red-300 border-red-800/60", dot: "bg-red-400" },
  Depression: { badge: "bg-purple-950/50 text-purple-300 border-purple-800/60", dot: "bg-purple-400" },
  Anxiety: { badge: "bg-teal-950/50 text-teal-300 border-teal-800/60", dot: "bg-teal-400" },
  Migraine: { badge: "bg-indigo-950/50 text-indigo-300 border-indigo-800/60", dot: "bg-indigo-400" },
  Asthma: { badge: "bg-cyan-950/50 text-cyan-300 border-cyan-800/60", dot: "bg-cyan-400" },
  Hypertension: { badge: "bg-orange-950/50 text-orange-300 border-orange-800/60", dot: "bg-orange-400" },
  Diabetes: { badge: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60", dot: "bg-emerald-400" },
  Fracture: { badge: "bg-yellow-950/50 text-yellow-300 border-yellow-800/60", dot: "bg-yellow-400" },
  Allergy: { badge: "bg-lime-950/50 text-lime-300 border-lime-800/60", dot: "bg-lime-400" },
  Infection: { badge: "bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-800/60", dot: "bg-fuchsia-400" },
  Stroke: { badge: "bg-rose-950/60 text-rose-300 border-rose-800/70", dot: "bg-rose-500" },
};

function getBadgeStyle(condition: string, index: number) {
  if (KNOWN_CONDITION_STYLES[condition]) {
    return KNOWN_CONDITION_STYLES[condition];
  }
  return BADGE_COLOR_PALETTES[index % BADGE_COLOR_PALETTES.length];
}

interface RecentAdmissionsProps {
  data: RecentAdmission[];
}

export function RecentAdmissions({ data }: RecentAdmissionsProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold text-foreground">
            Recent admissions
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Latest patients added to rosters.
          </CardDescription>
          <Link
            href="/patients"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors w-fit mt-0.5"
          >
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
            No recent admissions
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {data.map((admission, idx) => {
              const style = getBadgeStyle(admission.condition, idx);
              const cleanDoctor = admission.doctorName.startsWith("Dr.")
                ? admission.doctorName
                : `Dr. ${admission.doctorName}`;

              return (
                <div
                  key={admission._id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Styled Avatar Badge matching Doctor page */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 font-bold text-xs shadow-2xs">
                      {admission.patientInitials}
                    </div>
                    {/* Name & subtitle */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {admission.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        under {cleanDoctor} · Today
                      </p>
                    </div>
                  </div>

                  {/* Right side: Colorful Badge with colored dot on top, date on bottom */}
                  <div className="flex flex-col items-end shrink-0 ml-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-sm",
                        style.badge
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                      {admission.condition}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-1 font-normal">
                      {formatDate(admission.createdAt)}
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
