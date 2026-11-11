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
import { Doctor } from "@/types/doctor";
import { formatDate, getInitials } from "@/lib/utils";
import { Edit, Trash2, Users, ArrowUpRight, Phone, Mail } from "lucide-react";

interface DoctorTableProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export function DoctorTable({ doctors, onEdit, onDelete }: DoctorTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-foreground min-w-[220px]">
                Doctor
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Specialization
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Hospital
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center">
                Patients
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Registered
              </TableHead>
              <TableHead className="font-semibold text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => {
              const initials = getInitials(doctor.name);

              return (
                <TableRow
                  key={doctor._id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Doctor Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-semibold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 group-hover:underline"
                        >
                          <span>{doctor.name}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3 inline" /> {doctor.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Specialization */}
                  <TableCell>
                    <Badge variant="secondary" className="font-medium text-xs">
                      {doctor.specialization}
                    </Badge>
                  </TableCell>

                  {/* Hospital */}
                  <TableCell>
                    <span className="text-sm text-foreground font-medium">
                      {doctor.hospital}
                    </span>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-muted-foreground inline" />
                      {doctor.phone}
                    </span>
                  </TableCell>

                  {/* Patient Count */}
                  <TableCell className="text-center">
                    <Link
                      href={`/doctors/${doctor._id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="View assigned patients"
                    >
                      <Users className="h-3 w-3" />
                      <span>{doctor.patientCount ?? 0}</span>
                    </Link>
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(doctor.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(doctor)}
                        title="Edit Doctor"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(doctor)}
                        title="Delete Doctor"
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

