"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from "@/types/appointment";
import { useDoctors } from "@/hooks/use-doctors";
import { usePatients } from "@/hooks/use-patients";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSave: (data: CreateAppointmentInput | UpdateAppointmentInput) => Promise<void>;
}

const DURATIONS = [15, 30, 45, 60, 90];

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSave,
}: AppointmentDialogProps) {
  const isEditing = Boolean(appointment);

  const { data: doctorsData } = useDoctors({ limit: 100 });
  const { data: patientsData } = usePatients({ limit: 100 });

  const doctors = doctorsData?.doctors || [];
  const patients = patientsData?.patients || [];

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("06:30 PM");
  const [duration, setDuration] = useState(45);
  const [reason, setReason] = useState("");
  const [room, setRoom] = useState("");
  const [status, setStatus] = useState<Appointment["status"]>("scheduled");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (appointment) {
      const pId = typeof appointment.patientId === "object" ? appointment.patientId._id : appointment.patientId;
      const dId = typeof appointment.doctorId === "object" ? appointment.doctorId._id : appointment.doctorId;

      setPatientId(pId || "");
      setDoctorId(dId || "");
      setDate(appointment.date || new Date().toISOString().slice(0, 10));
      setTime(appointment.time || "06:30 PM");
      setDuration(appointment.duration || 45);
      setReason(appointment.reason || "");
      setRoom(appointment.room || "");
      setStatus(appointment.status || "scheduled");
    } else {
      // Defaults for new appointment
      setPatientId(patients[0]?._id || "");
      setDoctorId(doctors[0]?._id || "");
      setDate(new Date().toISOString().slice(0, 10));
      setTime("06:30 PM");
      setDuration(45);
      setReason("Routine check-up");
      setRoom("Room 160");
      setStatus("scheduled");
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment, open, doctors.length, patients.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !date || !time || !reason || !room) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSave({
        patientId,
        doctorId,
        date,
        time,
        duration,
        reason,
        room,
        status,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find((p) => p._id === patientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/80">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Edit appointment" : "New appointment"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Update the booking details or move it to another slot."
              : "Schedule a new clinical consultation and assign an available room."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Patient Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select patient">
                  {selectedPatient ? (
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="font-medium">{selectedPatient.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-2">
                        {selectedPatient.condition}
                      </span>
                    </div>
                  ) : (
                    "Select patient"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {patients.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.condition}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {doctors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name} — {d.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 pr-9 text-xs"
                  required
                />
                <CalendarIcon className="h-4 w-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Time</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="06:30 PM"
                  className="h-10 pr-9 text-xs"
                  required
                />
                <Clock className="h-4 w-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Duration</Label>
            <Select
              value={String(duration)}
              onValueChange={(val) => setDuration(Number(val))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Routine check-up, Post-op follow-up"
              className="h-10 text-xs"
              required
            />
          </div>

          {/* Room */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Room</Label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 160"
              className="h-10 text-xs"
              required
            />
          </div>

          {/* Slot availability indicator matching image */}
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium pt-1">
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
            <span>Slot available</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
