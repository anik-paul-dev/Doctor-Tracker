"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
} from "@/hooks/use-doctors";
import { DoctorFilters } from "@/components/doctors/doctor-filters";
import { DoctorTable } from "@/components/doctors/doctor-table";
import { DoctorCards } from "@/components/doctors/doctor-cards";
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
import { Doctor, DoctorFilters as FilterType } from "@/types/doctor";
import { CreateDoctorInput } from "@/lib/validations";
import { exportToCsv } from "@/lib/export";
import { formatDate } from "@/lib/utils";
import { Plus, Stethoscope } from "lucide-react";
import { toast } from "sonner";

const DoctorForm = dynamic(
  () => import("@/components/doctors/doctor-form").then((module) => module.DoctorForm),
  { loading: () => null }
);
const ConfirmDialog = dynamic(
  () => import("@/components/shared/confirm-dialog").then((module) => module.ConfirmDialog),
  { loading: () => null }
);

export default function DoctorsPage() {
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 12,
    search: "",
    specialization: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

  const { data, isLoading } = useDoctors(filters);
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      specialization: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleExport = () => {
    const list = data?.doctors || [];
    if (list.length === 0) {
      toast.error("No doctors to export");
      return;
    }

    const exportData = list.map((doc) => ({
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization,
      hospital: doc.hospital,
      phone: doc.phone,
      patients: doc.patientCount ?? 0,
      addedDate: formatDate(doc.createdAt),
    }));

    exportToCsv(
      `doctors_export_${new Date().toISOString().slice(0, 10)}`,
      exportData,
      [
        { key: "name", label: "Doctor Name" },
        { key: "email", label: "Email" },
        { key: "specialization", label: "Specialization" },
        { key: "hospital", label: "Hospital" },
        { key: "phone", label: "Phone" },
        { key: "patients", label: "Patients Count" },
        { key: "addedDate", label: "Date Added" },
      ]
    );

    toast.success(`Exported ${list.length} doctors to CSV`);
  };

  const handleCreateSubmit = async (formData: CreateDoctorInput) => {
    await createMutation.mutateAsync(formData);
    setCreateDialogOpen(false);
  };

  const handleUpdateSubmit = async (formData: CreateDoctorInput) => {
    if (!editingDoctor) return;
    await updateMutation.mutateAsync({
      id: editingDoctor._id,
      data: formData,
    });
    setEditingDoctor(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoctor) return;
    await deleteMutation.mutateAsync(deletingDoctor._id);
    setDeletingDoctor(null);
  };

  const doctors = data?.doctors || [];
  const pagination = data?.pagination;
  const totalDoctors = pagination?.total ?? doctors.length;

  return (
    <div className="space-y-6">
      {/* Page Header matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Doctors
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage physicians and their patient rosters.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-10 text-sm font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add doctor
        </Button>
      </div>

      {/* Filter and Search Bar matching Image 1 & 2 */}
      <DoctorFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalDoctors={totalDoctors}
        onExport={handleExport}
      />

      {/* Table or Cards / Loading / Empty States */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description={
            filters.search || filters.specialization || filters.startDate
              ? "No doctors matched your search criteria. Try clearing or relaxing your filters."
              : "No doctor records exist in the database yet. Click below to add the first doctor."
          }
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Doctor
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {viewMode === "table" ? (
            <DoctorTable
              doctors={doctors}
              onEdit={(doc) => setEditingDoctor(doc)}
              onDelete={(doc) => setDeletingDoctor(doc)}
            />
          ) : (
            <DoctorCards
              doctors={doctors}
              onEdit={(doc) => setEditingDoctor(doc)}
              onDelete={(doc) => setDeletingDoctor(doc)}
            />
          )}

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

      {/* Create Doctor Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the medical professional&apos;s details and hospital credentials.
            </DialogDescription>
          </DialogHeader>
          {createDialogOpen && <DoctorForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateDialogOpen(false)}
            loading={createMutation.isPending}
          />}
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog
        open={!!editingDoctor}
        onOpenChange={(open) => !open && setEditingDoctor(null)}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor Profile</DialogTitle>
            <DialogDescription>
              Update contact info or clinical hospital affiliation.
            </DialogDescription>
          </DialogHeader>
          {editingDoctor && (
            <DoctorForm
              initialData={editingDoctor}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setEditingDoctor(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deletingDoctor && <ConfirmDialog
        open={!!deletingDoctor}
        onOpenChange={(open) => !open && setDeletingDoctor(null)}
        title="Delete Doctor Record?"
        description={`Are you sure you want to delete ${deletingDoctor?.name}? This will also permanently remove all corresponding patient records registered under this doctor.`}
        confirmText="Yes, Delete Doctor"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />}
    </div>
  );
}
