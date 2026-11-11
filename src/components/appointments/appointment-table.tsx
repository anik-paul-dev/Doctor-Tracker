"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Check,
  CheckCheck,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";

interface AppointmentTableProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment["status"]) => void;
}

export function AppointmentTable({
  appointments,
  onEdit,
  onDelete,
  onUpdateStatus,
}: AppointmentTableProps) {
  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return {
          pill: "bg-teal-950/50 text-teal-300 border-teal-800/60",
          dot: "bg-teal-400",
          label: "Scheduled",
        };
      case "confirmed":
        return {
          pill: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60",
          dot: "bg-emerald-400",
          label: "Confirmed",
        };
      case "completed":
        return {
          pill: "bg-muted/40 text-muted-foreground border-border/60",
          dot: "bg-muted-foreground",
          label: "Completed",
        };
      case "cancelled":
        return {
          pill: "bg-rose-950/50 text-rose-300 border-rose-800/60",
          dot: "bg-rose-400",
          label: "Cancelled",
        };
      default:
        return {
          pill: "bg-muted text-muted-foreground border-border",
          dot: "bg-muted-foreground",
          label: status,
        };
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/30 border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="py-3 px-4">DATE & TIME</th>
            <th className="py-3 px-4">PATIENT</th>
            <th className="py-3 px-4">DOCTOR</th>
            <th className="py-3 px-4">REASON</th>
            <th className="py-3 px-4">ROOM</th>
            <th className="py-3 px-4">STATUS</th>
            <th className="py-3 px-4 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-muted-foreground">
                No appointments found.
              </td>
            </tr>
          ) : (
            appointments.map((appt) => {
              const statusStyle = getStatusBadge(appt.status);

              return (
                <tr
                  key={appt._id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Date & Time */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-xs">
                      {formatDate(appt.date)} · {appt.time}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {appt.duration} min
                    </p>
                  </td>

                  {/* Patient */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground text-sm">
                      {appt.patientName}
                    </span>
                  </td>

                  {/* Doctor */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-xs">
                      {appt.doctorName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {appt.doctorSpecialization}
                    </p>
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-4 text-muted-foreground">
                    {appt.reason}
                  </td>

                  {/* Room */}
                  <td className="py-3 px-4 font-mono text-muted-foreground">
                    {appt.room}
                  </td>

                  {/* Status Pill matching Image 9 */}
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-sm",
                        statusStyle.pill
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)}
                      />
                      {statusStyle.label}
                    </span>
                  </td>

                  {/* Actions Dropdown matching Image 9 */}
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(appt._id, "confirmed")}
                          className="cursor-pointer gap-2"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Mark confirmed</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(appt._id, "completed")}
                          className="cursor-pointer gap-2"
                        >
                          <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Mark completed</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(appt._id, "cancelled")}
                          className="cursor-pointer gap-2"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          <span>Mark cancelled</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onEdit(appt)}
                          className="cursor-pointer gap-2"
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary" />
                          <span>Edit appointment</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(appt)}
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete appointment</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

