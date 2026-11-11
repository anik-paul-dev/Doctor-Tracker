"use client";

import React, { useState } from "react";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";
import { PatientFilters } from "@/components/patients/patient-filters";
import { PatientTable } from "@/components/patients/patient-table";
import { PatientForm } from "@/components/patients/patient-form";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Patient, PatientFilters as FilterType } from "@/types/patient";
import { CreatePatientInput } from "@/lib/validations";
import { Plus, Users } from "lucide-react";

export default function PatientsPage() {
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 10,
    search: "",
    condition: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const { data, isLoading } = usePatients(filters);
  const { data: doctorsData } = useDoctors({ limit: 100 });
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      condition: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleCreateSubmit = async (formData: CreatePatientInput) => {
    await createMutation.mutateAsync(formData);
    setCreateDialogOpen(false);
  };

  const handleUpdateSubmit = async (formData: CreatePatientInput) => {
    if (!editingPatient) return;
    await updateMutation.mutateAsync({
      id: editingPatient._id,
      data: formData,
    });
    setEditingPatient(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPatient) return;
    await deleteMutation.mutateAsync(deletingPatient._id);
    setDeletingPatient(null);
  };

  const patients = data?.patients || [];
  const pagination = data?.pagination;
  const availableDoctors = doctorsData?.doctors || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Patient Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete hospital-wide patient directory with diagnosis categorization and clinician linkages
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-10 text-sm font-semibold shadow-sm"
          disabled={availableDoctors.length === 0}
          title={
            availableDoctors.length === 0
              ? "Please add a doctor first before registering patients"
              : undefined
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Patient
        </Button>
      </div>

      {/* Filter Bar */}
      <PatientFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Patients Table / Loading / Empty State */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patient records found"
          description={
            filters.search || filters.condition || filters.startDate
              ? "No patients matched your search criteria. Try modifying your filters."
              : "No patient records have been added to the system yet."
          }
          action={
            availableDoctors.length > 0 ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Register First Patient
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          <PatientTable
            patients={patients}
            showDoctor={true}
            onEdit={(patient) => setEditingPatient(patient)}
            onDelete={(patient) => setDeletingPatient(patient)}
          />

          {pagination && pagination.totalPages > 1 && (
            <DataTablePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(page) => handleFilterChange({ page })}
            />
          )}
        </div>
      )}

      {/* Register Patient Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Assign the patient to an attending doctor and specify their condition.
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            doctors={availableDoctors}
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateDialogOpen(false)}
            loading={createMutation.isPending}
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
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogDescription>
              Update contact info, diagnoses, or clinical notes.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              initialData={editingPatient}
              doctors={availableDoctors}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setEditingPatient(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingPatient}
        onOpenChange={(open) => !open && setDeletingPatient(null)}
        title="Delete Patient Record?"
        description={`Are you sure you want to delete ${deletingPatient?.name}? This record will be permanently purged from the medical tracker.`}
        confirmText="Yes, Delete Patient"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

