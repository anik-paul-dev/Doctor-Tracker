"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";
import { PatientFilters } from "@/components/patients/patient-filters";
import { PatientTable } from "@/components/patients/patient-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
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
import { exportToCsv } from "@/lib/export";
import { formatDate } from "@/lib/utils";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

const PatientForm = dynamic(
  () => import("@/components/patients/patient-form").then((module) => module.PatientForm),
  { loading: () => null }
);
const ConfirmDialog = dynamic(
  () => import("@/components/shared/confirm-dialog").then((module) => module.ConfirmDialog),
  { loading: () => null }
);

export default function PatientsPage() {
  const searchParams = useSearchParams();
  const initialCondition = searchParams.get("condition");

  const [filters, setFilters] = useState<FilterType>(() => {
    let cond = undefined;
    if (initialCondition) {
      cond = initialCondition.charAt(0).toUpperCase() + initialCondition.slice(1).toLowerCase();
    }
    return {
      page: 1,
      limit: 10,
      search: "",
      condition: cond,
      doctorId: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  });

  useEffect(() => {
    const c = searchParams.get("condition");
    if (c) {
      const formatted = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      setFilters((prev) => ({ ...prev, condition: formatted, page: 1 }));
    }
  }, [searchParams]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const { data, isLoading } = usePatients(filters);
  const formOpen = createDialogOpen || Boolean(editingPatient);
  const { data: doctorAvailability } = useDoctors({ limit: 1 });
  const { data: doctorsData } = useDoctors({ limit: 100 }, formOpen);
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
      doctorId: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleExport = () => {
    const allPatients = data?.patients || [];
    if (allPatients.length === 0) {
      toast.error("No patients to export");
      return;
    }

    const targetList = allPatients;
    const exportData = targetList.map((p) => {
      const doc =
        typeof p.doctorId === "object" && p.doctorId !== null ? p.doctorId : null;

      return {
        name: p.name,
        age: p.age,
        gender: p.gender,
        condition: p.condition,
        doctor: doc?.name || "Unassigned",
        doctorSpecialization: doc?.specialization || "",
        email: p.email || "",
        phone: p.phone,
        admittedDate: formatDate(p.createdAt),
      };
    });

    exportToCsv(
      `patients_export_${new Date().toISOString().slice(0, 10)}`,
      exportData,
      [
        { key: "name", label: "Patient Name" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "condition", label: "Condition" },
        { key: "doctor", label: "Doctor" },
        { key: "doctorSpecialization", label: "Specialization" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "admittedDate", label: "Admitted Date" },
      ]
    );

    toast.success(`Exported ${targetList.length} patients to CSV`);
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
  const hasDoctors = (doctorAvailability?.pagination.total ?? 0) > 0;
  const totalPatients = pagination?.total ?? patients.length;

  return (
    <div className="space-y-6">
      {/* Page Header matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Patients
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Every patient across all doctors — register, update or discharge records.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-10 text-sm font-semibold shadow-sm"
          disabled={!hasDoctors}
          title={
            !hasDoctors
              ? "Please add a doctor first before registering patients"
              : undefined
          }
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Register patient
        </Button>
      </div>

      {/* Filter Bar matching Image 3 & 4 */}
      <PatientFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        doctors={availableDoctors}
        totalPatients={totalPatients}
        onExport={handleExport}
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
            hasDoctors ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Register First Patient
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
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
          {createDialogOpen && (doctorsData ? (
            <PatientForm
              doctors={availableDoctors}
              onSubmit={handleCreateSubmit}
              onCancel={() => setCreateDialogOpen(false)}
              loading={createMutation.isPending}
            />
          ) : (
            <div role="status" className="h-64 animate-pulse rounded-lg bg-muted/40" />
          ))}
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
      {deletingPatient && <ConfirmDialog
        open={!!deletingPatient}
        onOpenChange={(open) => !open && setDeletingPatient(null)}
        title="Delete Patient Record?"
        description={`Are you sure you want to delete ${deletingPatient?.name}? This record will be permanently purged from the medical tracker.`}
        confirmText="Yes, Delete Patient"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />}
    </div>
  );
}
