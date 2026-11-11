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
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { formatDate, getInitials, generateAvatarColor, cn } from "@/lib/utils";
import { Edit, Trash2, Stethoscope, Phone, Mail } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  showDoctor?: boolean;
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
}: PatientTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-foreground min-w-[200px]">
                Patient
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Age / Gender
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Condition
              </TableHead>
              {showDoctor && (
                <TableHead className="font-semibold text-foreground min-w-[180px]">
                  Attending Doctor
                </TableHead>
              )}
              <TableHead className="font-semibold text-foreground">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Date Added
              </TableHead>
              <TableHead className="font-semibold text-foreground text-right">
                Actions
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

              return (
                <TableRow
                  key={patient._id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Patient Name & Details */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold shadow-sm",
                          generateAvatarColor(patient.name)
                        )}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {patient.name}
                        </span>
                        {patient.email ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3 inline" /> {patient.email}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No email on file
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Age & Gender */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-medium text-foreground">
                        {patient.age} yrs
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="capitalize text-muted-foreground text-xs">
                        {patient.gender}
                      </span>
                    </div>
                  </TableCell>

                  {/* Medical Condition with colorful pill & dot matching Image 3 */}
                  <TableCell>
                    {(() => {
                      const style = getConditionStyle(patient.condition);
                      return (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-sm",
                            style.pill
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                          {patient.condition}
                        </span>
                      );
                    })()}
                  </TableCell>

                  {/* Attending Doctor */}
                  {showDoctor && (
                    <TableCell>
                      {doctor ? (
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{doctor.name}</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Assigned
                        </span>
                      )}
                    </TableCell>
                  )}

                  {/* Contact */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-muted-foreground inline" />
                      {patient.phone}
                    </span>
                  </TableCell>

                  {/* Registration Date */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(patient.createdAt)}
                  </TableCell>

                  {/* Action buttons */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(patient)}
                        title="Edit Patient"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(patient)}
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
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

