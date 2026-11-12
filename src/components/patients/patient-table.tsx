"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { formatDate, formatRelativeTime, getInitials, generateAvatarColor, cn } from "@/lib/utils";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  showDoctor?: boolean;
  selectedIds?: string[];
  onSelectToggle?: (id: string) => void;
  onSelectAllToggle?: () => void;
}

const CONDITION_STYLES: Record<string, { pill: string; dot: string }> = {
  Critical: { pill: "bg-rose-950/60 text-rose-300 border-rose-800/70", dot: "bg-rose-500" },
  Serious: { pill: "bg-amber-950/60 text-amber-300 border-amber-800/70", dot: "bg-amber-400" },
  Stable: { pill: "bg-emerald-950/60 text-emerald-300 border-emerald-800/70", dot: "bg-emerald-400" },
  Recovering: { pill: "bg-teal-950/60 text-teal-300 border-teal-800/70", dot: "bg-teal-400" },
  Discharged: { pill: "bg-slate-900/60 text-slate-300 border-slate-700/70", dot: "bg-slate-400" },
  "Heart Disease": { pill: "bg-rose-950/50 text-rose-300 border-rose-800/60", dot: "bg-rose-400" },
  Arthritis: { pill: "bg-amber-950/50 text-amber-300 border-amber-800/60", dot: "bg-amber-400" },
  "Chronic Pain": { pill: "bg-pink-950/50 text-pink-300 border-pink-800/60", dot: "bg-pink-400" },
  "Kidney Disease": { pill: "bg-sky-950/50 text-sky-300 border-sky-800/60", dot: "bg-sky-400" },
  Depression: { pill: "bg-purple-950/50 text-purple-300 border-purple-800/60", dot: "bg-purple-400" },
  Anxiety: { pill: "bg-teal-950/50 text-teal-300 border-teal-800/60", dot: "bg-teal-400" },
  Migraine: { pill: "bg-indigo-950/50 text-indigo-300 border-indigo-800/60", dot: "bg-indigo-400" },
  Asthma: { pill: "bg-cyan-950/50 text-cyan-300 border-cyan-800/60", dot: "bg-cyan-400" },
  Hypertension: { pill: "bg-orange-950/50 text-orange-300 border-orange-800/60", dot: "bg-orange-400" },
  Diabetes: { pill: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60", dot: "bg-emerald-400" },
};

function getConditionStyle(condition: string) {
  return (
    CONDITION_STYLES[condition] || {
      pill: "bg-muted/50 text-muted-foreground border-border/60",
      dot: "bg-muted-foreground",
    }
  );
}

export function PatientTable({
  patients,
  onEdit,
  onDelete,
  showDoctor = true,
  selectedIds = [],
  onSelectToggle,
  onSelectAllToggle,
}: PatientTableProps) {
  const allSelected =
    patients.length > 0 && patients.every((p) => selectedIds.includes(p._id));

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/80">
              {/* Checkbox Header matching Image 3 */}
              <TableHead className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAllToggle}
                  aria-label="Select all patients"
                  className="h-4 w-4 rounded border-border/80 bg-muted/40 text-primary focus:ring-primary/40 cursor-pointer accent-teal-600"
                />
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[200px]">
                Patient
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Age / Gender
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Condition
              </TableHead>
              {showDoctor && (
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[180px]">
                  Doctor
                </TableHead>
              )}
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Admitted
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const initials = getInitials(patient.name);
              const doctor =
                typeof patient.doctorId === "object" && patient.doctorId !== null
                  ? patient.doctorId
                  : null;

              const isSelected = selectedIds.includes(patient._id);
              const isToday =
                new Date(patient.createdAt).toDateString() === new Date().toDateString();

              return (
                <TableRow
                  key={patient._id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors border-b border-border/60",
                    isSelected && "bg-muted/30"
                  )}
                >
                  {/* Row Checkbox */}
                  <TableCell className="w-10 px-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectToggle && onSelectToggle(patient._id)}
                      aria-label={`Select ${patient.name}`}
                      className="h-4 w-4 rounded border-border/80 bg-muted/40 text-primary focus:ring-primary/40 cursor-pointer accent-teal-600"
                    />
                  </TableCell>

                  {/* Patient Name & Details */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold shadow-2xs",
                          generateAvatarColor(patient.name)
                        )}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {patient.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {patient.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Age & Gender */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <span>{patient.age} yrs</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="capitalize">{patient.gender}</span>
                    </div>
                  </TableCell>

                  {/* Medical Condition with colorful pill & dot matching Image 3 */}
                  <TableCell>
                    {(() => {
                      const style = getConditionStyle(patient.condition);
                      return (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-2xs",
                            style.pill
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                          {patient.condition}
                        </span>
                      );
                    })()}
                  </TableCell>

                  {/* Attending Doctor + Specialization underneath matching Image 3 */}
                  {showDoctor && (
                    <TableCell>
                      {doctor ? (
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/doctors/${doctor._id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate"
                          >
                            {doctor.name}
                          </Link>
                          <span className="text-xs text-muted-foreground truncate">
                            {doctor.specialization || "General"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Assigned
                        </span>
                      )}
                    </TableCell>
                  )}

                  {/* Registration / Admitted Date matching Image 3 */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">
                        {formatDate(patient.createdAt)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {isToday ? "Today" : formatRelativeTime(patient.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action dropdown (...) matching Image 3 */}
                  <TableCell className="text-right">
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
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() => onEdit(patient)}
                          className="flex items-center gap-2 cursor-pointer text-xs"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(patient)}
                          className="flex items-center gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
