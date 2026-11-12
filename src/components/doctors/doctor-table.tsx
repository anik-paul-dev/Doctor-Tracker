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
import { Doctor } from "@/types/doctor";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { SPECIALIZATION_STYLES } from "@/lib/constants";
import {
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface DoctorTableProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export function DoctorTable({ doctors, onEdit, onDelete }: DoctorTableProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/80">
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[220px]">
                Doctor
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Specialization
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Hospital
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Patients
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Added
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => {
              const initials = getInitials(doctor.name);
              const specStyle =
                SPECIALIZATION_STYLES[doctor.specialization] ||
                "bg-muted/70 text-muted-foreground border-border/80";

              return (
                <TableRow
                  key={doctor._id}
                  className="hover:bg-muted/30 transition-colors border-b border-border/60"
                >
                  {/* Doctor Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 font-bold text-xs shadow-2xs">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                        >
                          {doctor.name}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate">
                          {doctor.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Specialization Badge */}
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-2xs",
                        specStyle
                      )}
                    >
                      {doctor.specialization}
                    </span>
                  </TableCell>

                  {/* Hospital */}
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {doctor.hospital}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono">
                      {doctor.phone}
                    </span>
                  </TableCell>

                  {/* Patient Count Pill */}
                  <TableCell>
                    <Link
                      href={`/doctors/${doctor._id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950/40 text-teal-300 border border-teal-800/60 hover:bg-teal-900/40 transition-colors"
                      title="View assigned patients"
                    >
                      <Users className="h-3 w-3" />
                      <span>{doctor.patientCount ?? 0}</span>
                    </Link>
                  </TableCell>

                  {/* Date Added */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(doctor.createdAt)}
                  </TableCell>

                  {/* Actions Dropdown (...) */}
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
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/doctors/${doctor._id}`}
                            className="flex items-center gap-2 cursor-pointer text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(doctor)}
                          className="flex items-center gap-2 cursor-pointer text-xs"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit Doctor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(doctor)}
                          className="flex items-center gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Doctor
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
