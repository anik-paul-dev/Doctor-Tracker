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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { formatDate, getInitials } from "@/lib/utils";
import { Edit, Trash2, Stethoscope, Phone, Mail } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  showDoctor?: boolean;
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
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
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

                  {/* Medical Condition */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-medium text-xs bg-muted/50 border-primary/20 text-foreground"
                    >
                      {patient.condition}
                    </Badge>
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

