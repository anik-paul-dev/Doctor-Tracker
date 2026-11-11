"use client";

import React, { useState } from "react";
import {
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
} from "@/hooks/use-doctors";
import { DoctorFilters } from "@/components/doctors/doctor-filters";
import { DoctorTable } from "@/components/doctors/doctor-table";
import { DoctorForm } from "@/components/doctors/doctor-form";
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
import { Doctor, DoctorFilters as FilterType } from "@/types/doctor";
import { CreateDoctorInput } from "@/lib/validations";
import { Plus, Stethoscope } from "lucide-react";

export default function DoctorsPage() {
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 10,
    search: "",
    specialization: undefined,
    startDate: undefined,
    endDate: undefined,
  });

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
      limit: 10,
      search: "",
      specialization: undefined,
      startDate: undefined,
      endDate: undefined,
    });
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Doctor Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add practitioners, manage hospital affiliations, and monitor active caseloads
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-10 text-sm font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Doctor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <DoctorFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table / Loading / Empty States */}
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
        <div className="space-y-2">
          <DoctorTable
            doctors={doctors}
            onEdit={(doc) => setEditingDoctor(doc)}
            onDelete={(doc) => setDeletingDoctor(doc)}
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

      {/* Create Doctor Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the medical professional&apos;s details and hospital credentials.
            </DialogDescription>
          </DialogHeader>
          <DoctorForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateDialogOpen(false)}
            loading={createMutation.isPending}
          />
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
      <ConfirmDialog
        open={!!deletingDoctor}
        onOpenChange={(open) => !open && setDeletingDoctor(null)}
        title="Delete Doctor Record?"
        description={`Are you sure you want to delete ${deletingDoctor?.name}? This will also permanently remove all corresponding patient records registered under this doctor.`}
        confirmText="Yes, Delete Doctor"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

