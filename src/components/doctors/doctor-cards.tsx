"use client";

import React from "react";
import Link from "next/link";
import { Doctor } from "@/types/doctor";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { SPECIALIZATION_STYLES } from "@/lib/constants";
import {
  Building2,
  Phone,
  Mail,
  Users,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface DoctorCardsProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export function DoctorCards({ doctors, onEdit, onDelete }: DoctorCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map((doctor) => {
        const initials = getInitials(doctor.name);
        const specStyle =
          SPECIALIZATION_STYLES[doctor.specialization] ||
          "bg-muted/70 text-muted-foreground border-border/80";

        return (
          <div
            key={doctor._id}
            className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-border transition-all flex flex-col justify-between gap-4"
          >
            {/* Top Row: Avatar + Name + Specialization Badge */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 font-bold text-xs shadow-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/doctors/${doctor._id}`}
                  className="font-bold text-foreground text-sm sm:text-base hover:text-primary transition-colors truncate block"
                >
                  {doctor.name}
                </Link>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border shadow-2xs",
                      specStyle
                    )}
                  >
                    {doctor.specialization}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Info Lines with Icons */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{doctor.hospital}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{doctor.email}</span>
              </div>
            </div>

            {/* Bottom Footer Row: Patients Badge, Date, Action Icons */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
              {/* Patients pill badge */}
              <Link
                href={`/doctors/${doctor._id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-950/40 text-teal-300 border border-teal-800/60 hover:bg-teal-900/40 transition-colors"
                title="View assigned patients"
              >
                <Users className="h-3.5 w-3.5" />
                <span>{doctor.patientCount ?? 0} patients</span>
              </Link>

              {/* Added Date */}
              <span className="text-muted-foreground text-[11px]">
                {formatDate(doctor.createdAt)}
              </span>

              {/* Action Icons */}
              <div className="flex items-center gap-0.5">
                <Link
                  href={`/doctors/${doctor._id}`}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="View Profile"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => onEdit(doctor)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Edit Doctor"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(doctor)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Delete Doctor"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

