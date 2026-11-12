"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  weekStart: Date;
  onWeekStartChange: (date: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const HOURS = [
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

const CARD_COLORS = [
  {
    bg: "bg-teal-950/60 border-teal-700/60 text-teal-200 hover:border-teal-500",
    dot: "bg-teal-400",
  },
  {
    bg: "bg-emerald-950/60 border-emerald-700/60 text-emerald-200 hover:border-emerald-500",
    dot: "bg-emerald-400",
  },
  {
    bg: "bg-sky-950/60 border-sky-700/60 text-sky-200 hover:border-sky-500",
    dot: "bg-sky-400",
  },
  {
    bg: "bg-purple-950/60 border-purple-700/60 text-purple-200 hover:border-purple-500",
    dot: "bg-purple-400",
  },
  {
    bg: "bg-rose-950/60 border-rose-700/60 text-rose-200 hover:border-rose-500",
    dot: "bg-rose-400",
  },
  {
    bg: "bg-amber-950/60 border-amber-700/60 text-amber-200 hover:border-amber-500",
    dot: "bg-amber-400",
  },
];

export function AppointmentCalendar({
  appointments,
  weekStart,
  onWeekStartChange,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const changeWeek = (offset: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + offset * 7);
    onWeekStartChange(next);
  };

  const setToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    onWeekStartChange(monday);
  };

  // Generate 7 days for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = localDateKey(d);
    const isToday = localDateKey(new Date()) === dateStr;
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });

    return {
      date: d,
      dateStr,
      dayName,
      dayNum,
      monthName,
      isToday,
    };
  });

  const rangeStart = `${weekDays[0].monthName} ${weekDays[0].dayNum}`;
  const rangeEnd = `${weekDays[6].monthName} ${weekDays[6].dayNum}, ${weekDays[6].date.getFullYear()}`;
  const weekLabel = `${rangeStart} – ${rangeEnd}`;

  // Filter appointments for this week
  const weekDateStrs = new Set(weekDays.map((w) => w.dateStr));
  const weekAppointments = appointments.filter((a) => weekDateStrs.has(a.date));

  // Helper to parse time to hour for calendar row mapping
  const getHourSlot = (timeStr: string) => {
    // Expected format "06:30 PM", "6:15 PM", "16:00", etc.
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return "16:00";
    let hour = parseInt(match[1], 10);
    const period = match[3]?.toUpperCase();

    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    const formatted = `${String(hour).padStart(2, "0")}:00`;
    return HOURS.includes(formatted) ? formatted : "16:00";
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls matching Image 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/60">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => changeWeek(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => changeWeek(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-semibold"
            onClick={setToday}
          >
            Today
          </Button>
          <span className="font-semibold text-sm text-foreground ml-2">
            {weekLabel}
          </span>
        </div>

        <div className="text-xs font-medium text-muted-foreground">
          <strong className="text-foreground">{weekAppointments.length}</strong>{" "}
          appointments this week
        </div>
      </div>

      {/* Week Grid Table matching Image 7 */}
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
        <div className="min-w-[840px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/60 text-center bg-muted/20">
            <div className="py-3 text-xs font-semibold text-muted-foreground border-r border-border/40">
              TIME
            </div>
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                className={cn(
                  "py-3 px-2 border-r last:border-r-0 border-border/40 flex flex-col items-center justify-center gap-1",
                  d.isToday && "bg-teal-950/20"
                )}
              >
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                  {d.dayName}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {d.dayNum} {d.monthName}
                </span>
                {d.isToday && (
                  <span className="inline-flex rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.2 text-[10px] font-bold">
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Hourly Slots */}
          <div className="divide-y divide-border/40">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[76px]"
              >
                {/* Time label on left */}
                <div className="py-2.5 px-3 text-xs font-mono text-muted-foreground border-r border-border/40 text-center select-none">
                  {hour}
                </div>

                {/* 7 Day Cells */}
                {weekDays.map((day) => {
                  const cellAppts = weekAppointments.filter(
                    (a) => a.date === day.dateStr && getHourSlot(a.time) === hour
                  );

                  return (
                    <div
                      key={day.dateStr + hour}
                      className="p-1 border-r last:border-r-0 border-border/30 relative flex flex-col gap-1 min-h-[76px]"
                    >
                      {cellAppts.map((appt, idx) => {
                        const style = CARD_COLORS[idx % CARD_COLORS.length];
                        return (
                          <div
                            key={appt._id}
                            onClick={() => onSelectAppointment(appt)}
                            className={cn(
                              "group p-2 rounded-lg border text-left cursor-pointer transition-all shadow-sm hover:scale-[1.02]",
                              style.bg
                            )}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold leading-tight">
                              <span>{appt.time}</span>
                              <span className="text-muted-foreground group-hover:text-foreground text-[10px]">
                                ···
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-foreground truncate mt-0.5">
                              {appt.patientName}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {appt.room}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

