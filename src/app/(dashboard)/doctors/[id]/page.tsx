"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDoctor, useDoctorPatients } from "@/hooks/use-doctors";
import {
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/use-patients";
import { PatientTable } from "@/components/patients/patient-table";
import { PatientForm } from "@/components/patients/patient-form";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchInput } from "@/components/shared/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  Phone,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { Patient, PatientFilters } from "@/types/patient";
import { CreatePatientInput } from "@/lib/validations";

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params.id as string;

  const [filters, setFilters] = useState<PatientFilters>({
    page: 1,
    limit: 10,
    search: "",
  });

  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const { data: doctor, isLoading: doctorLoading } = useDoctor(doctorId);
  const { data: patientsData, isLoading: patientsLoading } = useDoctorPatients(
    doctorId,
    filters
  );

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  const handleCreatePatientSubmit = async (formData: CreatePatientInput) => {
    await createPatientMutation.mutateAsync({
      ...formData,
      doctorId,
    });
    setAddPatientOpen(false);
  };

  const handleUpdatePatientSubmit = async (formData: CreatePatientInput) => {
    if (!editingPatient) return;
    await updatePatientMutation.mutateAsync({
      id: editingPatient._id,
      data: formData,
    });
    setEditingPatient(null);
  };

  const handleDeletePatientConfirm = async () => {
    if (!deletingPatient) return;
    await deletePatientMutation.mutateAsync(deletingPatient._id);
    setDeletingPatient(null);
  };

  const patients = patientsData?.patients || [];
  const pagination = patientsData?.pagination;

  if (doctorLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-44 bg-card border rounded-xl animate-pulse" />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="Doctor profile not found"
        description="The practitioner record you are trying to view does not exist or has been removed."
        action={
          <Link href="/doctors">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Doctors List
            </Button>
          </Link>
        }
      />
    );
  }

  const initials = getInitials(doctor.name);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Doctors List
        </Link>
      </div>

      {/* Doctor Summary Header Card */}
      <Card className="border shadow-sm overflow-hidden bg-gradient-to-r from-card to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-teal-800/80 shadow-sm rounded-2xl">
                <AvatarFallback className="bg-teal-950/70 text-teal-300 text-xl font-bold rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {doctor.name}
                  </h2>
                  <Badge variant="default" className="text-xs">
                    {doctor.specialization}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {doctor.hospital}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {doctor.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {doctor.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {formatDate(doctor.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-center sm:text-left">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Assigned Patients
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  {doctor.patientCount ?? 0}
                </p>
              </div>

              <Button
                onClick={() => setAddPatientOpen(true)}
                className="h-10 text-sm font-semibold shadow-sm shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corresponding Patients Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Assigned Patients for {doctor.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Review, update, or discharge patients currently assigned to this physician
            </p>
          </div>

          <div className="w-full sm:w-64">
            <SearchInput
              value={filters.search || ""}
              onChange={(search) =>
                setFilters((prev) => ({ ...prev, search, page: 1 }))
              }
              placeholder="Filter this doctor's patients..."
            />
          </div>
        </div>

        {patientsLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients assigned"
            description={
              filters.search
                ? "No patients matched your search query under this doctor."
                : `Dr. ${doctor.name} currently has no patients assigned. Click below to add a new patient.`
            }
            action={
              <Button onClick={() => setAddPatientOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            <PatientTable
              patients={patients}
              showDoctor={false}
              onEdit={(patient) => setEditingPatient(patient)}
              onDelete={(patient) => setDeletingPatient(patient)}
            />

            {pagination && pagination.totalPages > 1 && (
              <DataTablePagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Patient Under {doctor.name}</DialogTitle>
            <DialogDescription>
              Assign a new patient under {doctor.name} ({doctor.specialization}).
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            defaultDoctorId={doctorId}
            onSubmit={handleCreatePatientSubmit}
            onCancel={() => setAddPatientOpen(false)}
            loading={createPatientMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog
        open={!!editingPatient}
        onOpenChange={(open) => !open && setEditingPatient(null)}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Patient Details</DialogTitle>
            <DialogDescription>
              Update patient information, condition, or clinical notes.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              initialData={editingPatient}
              defaultDoctorId={doctorId}
              onSubmit={handleUpdatePatientSubmit}
              onCancel={() => setEditingPatient(null)}
              loading={updatePatientMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingPatient}
        onOpenChange={(open) => !open && setDeletingPatient(null)}
        title="Discharge / Delete Patient?"
        description={`Are you sure you want to delete ${deletingPatient?.name} from ${doctor.name}'s patient list? This will remove the patient record and update the doctor's active patient count.`}
        confirmText="Yes, Delete Patient"
        loading={deletePatientMutation.isPending}
        onConfirm={handleDeletePatientConfirm}
      />
    </div>
  );
}

