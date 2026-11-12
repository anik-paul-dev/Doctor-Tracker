"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodayScheduleItem } from "@/types/dashboard";

interface TodayScheduleProps {
  items?: TodayScheduleItem[];
}

export function TodaySchedule({ items = [] }: TodayScheduleProps) {
  const router = useRouter();

  const getStatusBadge = (status: TodayScheduleItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          pill: "bg-muted/40 text-muted-foreground border-border/60",
          dot: "bg-muted-foreground",
          label: "Completed",
        };
      case "confirmed":
        return {
          pill: "bg-emerald-950/40 text-emerald-300 border-emerald-800/50",
          dot: "bg-emerald-400",
          label: "Confirmed",
        };
      case "cancelled":
        return {
          pill: "bg-rose-950/40 text-rose-300 border-rose-800/50",
          dot: "bg-rose-400",
          label: "Cancelled",
        };
      case "scheduled":
      default:
        return {
          pill: "bg-teal-950/40 text-teal-300 border-teal-800/50",
          dot: "bg-teal-400",
          label: "Scheduled",
        };
    }
  };

  return (
    <Card className="border shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-400 shrink-0" />
            <CardTitle className="text-base font-semibold text-foreground">
              Today&apos;s Schedule
            </CardTitle>
          </div>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted/60 text-foreground border border-border/60">
            {items.length} today
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Consultation run sheet for today.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1 pb-4 flex-1">
        <div className="divide-y divide-border/40">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No appointments scheduled for today.</p>
          ) : items.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                onClick={() => router.push("/appointments")}
                className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 rounded-md transition-colors cursor-pointer"
              >
                {/* Left: Time */}
                <span className="text-xs font-bold text-foreground w-20 shrink-0">
                  {item.time}
                </span>

                {/* Middle: Patient & Doctor/Room */}
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.doctorName} <span className="text-muted-foreground/60">·</span> {item.room}
                  </p>
                </div>

                {/* Right: Status Pill */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0",
                    badge.pill
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-border/40 text-center">
          <Link
            href="/appointments"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            Open full appointments calendar →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

