"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPatientSchema, CreatePatientInput } from "@/lib/validations";
import { PATIENT_CONDITIONS, GENDERS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Patient } from "@/types/patient";
import { Doctor } from "@/types/doctor";

interface PatientFormProps {
  initialData?: Patient | null;
  defaultDoctorId?: string;
  doctors?: Doctor[];
  onSubmit: (data: CreatePatientInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PatientForm({
  initialData,
  defaultDoctorId,
  doctors = [],
  onSubmit,
  onCancel,
  loading = false,
}: PatientFormProps) {
  const getInitialDoctorId = () => {
    if (defaultDoctorId) return defaultDoctorId;
    if (initialData) {
      return typeof initialData.doctorId === "string"
        ? initialData.doctorId
        : initialData.doctorId?._id || "";
    }
    return doctors[0]?._id || "";
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      doctorId: getInitialDoctorId(),
      name: initialData?.name || "",
      age: initialData?.age ? Number(initialData.age) : (undefined as unknown as number),
      gender: initialData?.gender || "male",
      condition: initialData?.condition || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
    },
  });

  const selectedGender = watch("gender");
  const selectedCondition = watch("condition");
  const selectedDoctorId = watch("doctorId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Doctor Selection (only if not fixed by context) */}
      {!defaultDoctorId && doctors.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="doctorId">Attending Doctor *</Label>
          <Select
            value={selectedDoctorId}
            onValueChange={(val) => setValue("doctorId", val, { shouldValidate: true })}
            disabled={loading || !!initialData}
          >
            <SelectTrigger id="doctorId">
              <SelectValue placeholder="Assign a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doc) => (
                <SelectItem key={doc._id} value={doc._id}>
                  {doc.name} — {doc.specialization} ({doc.hospital})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.doctorId && (
            <p className="text-xs text-destructive">{errors.doctorId.message}</p>
          )}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Patient Full Name *</Label>
        <Input
          id="name"
          placeholder="e.g. Eleanor Vance"
          {...register("name")}
          disabled={loading}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Age & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={150}
            placeholder="35"
            {...register("age", { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.age && (
            <p className="text-xs text-destructive">{errors.age.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={selectedGender}
            onValueChange={(val: "male" | "female" | "other") =>
              setValue("gender", val, { shouldValidate: true })
            }
            disabled={loading}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g} className="capitalize">
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-xs text-destructive">{errors.gender.message}</p>
          )}
        </div>
      </div>

      {/* Medical Condition */}
      <div className="space-y-1.5">
        <Label htmlFor="condition">Medical Condition *</Label>
        <Select
          value={selectedCondition}
          onValueChange={(val) => setValue("condition", val, { shouldValidate: true })}
          disabled={loading}
        >
          <SelectTrigger id="condition">
            <SelectValue placeholder="Select diagnosis / condition" />
          </SelectTrigger>
          <SelectContent>
            {PATIENT_CONDITIONS.map((cond) => (
              <SelectItem key={cond} value={cond}>
                {cond}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.condition && (
          <p className="text-xs text-destructive">{errors.condition.message}</p>
        )}
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            placeholder="+1 (555) 987-6543"
            {...register("phone")}
            disabled={loading}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="patient@example.com"
            {...register("email")}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Address & Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Clinical Notes & Observations (Optional)</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Enter allergies, recurring symptoms, or prescription notes..."
          {...register("notes")}
          disabled={loading}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Patient" : "Add Patient"}
        </Button>
      </div>
    </form>
  );
}

