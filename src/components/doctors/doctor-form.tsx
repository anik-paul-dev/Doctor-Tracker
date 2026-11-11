"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDoctorSchema, CreateDoctorInput } from "@/lib/validations";
import { SPECIALIZATIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Doctor } from "@/types/doctor";

interface DoctorFormProps {
  initialData?: Doctor | null;
  onSubmit: (data: CreateDoctorInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DoctorForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: DoctorFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      name: initialData?.name || "",
      specialization: initialData?.specialization || "",
      hospital: initialData?.hospital || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
    },
  });

  const selectedSpecialization = watch("specialization");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          placeholder="Dr. Alexander Fleming"
          {...register("name")}
          disabled={loading}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Specialization */}
      <div className="space-y-1.5">
        <Label htmlFor="specialization">Specialization *</Label>
        <Select
          value={selectedSpecialization}
          onValueChange={(val) => setValue("specialization", val, { shouldValidate: true })}
          disabled={loading}
        >
          <SelectTrigger id="specialization">
            <SelectValue placeholder="Select a medical specialization" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.specialization && (
          <p className="text-xs text-destructive">
            {errors.specialization.message}
          </p>
        )}
      </div>

      {/* Hospital */}
      <div className="space-y-1.5">
        <Label htmlFor="hospital">Hospital / Clinic *</Label>
        <Input
          id="hospital"
          placeholder="St. Jude Medical Center"
          {...register("hospital")}
          disabled={loading}
        />
        {errors.hospital && (
          <p className="text-xs text-destructive">{errors.hospital.message}</p>
        )}
      </div>

      {/* Grid: Phone & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="+1 (555) 234-5678"
            {...register("phone")}
            disabled={loading}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@hospital.org"
            {...register("email")}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
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
          {initialData ? "Save Changes" : "Create Doctor"}
        </Button>
      </div>
    </form>
  );
}

