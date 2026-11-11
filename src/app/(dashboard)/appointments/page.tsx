"use client";

import React, { useState } from "react";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/use-appointments";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { AppointmentTable } from "@/components/appointments/appointment-table";
import { AppointmentDialog } from "@/components/appointments/appointment-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { SearchInput } from "@/components/shared/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentFilters, CreateAppointmentInput, UpdateAppointmentInput } from "@/types/appointment";

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    limit: 20,
    search: "",
    status: undefined,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

  const { data, isLoading } = useAppointments(filters);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const appointments = data?.appointments || [];
  const pagination = data?.pagination;

  const handleOpenNew = () => {
    setEditingAppointment(null);
    setDialogOpen(true);
  };

  const handleSelectAppointment = (appt: Appointment) => {
    setEditingAppointment(appt);
    setDialogOpen(true);
  };

  const handleSave = async (formData: CreateAppointmentInput | UpdateAppointmentInput) => {
    if (editingAppointment) {
      await updateMutation.mutateAsync({
        id: editingAppointment._id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData as CreateAppointmentInput);
    }
  };

  const handleUpdateStatus = async (id: string, status: Appointment["status"]) => {
    await updateMutation.mutateAsync({
      id,
      data: { status },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppointment) return;
    await deleteMutation.mutateAsync(deletingAppointment._id);
    setDeletingAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header matching Image 7 & Image 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Appointments
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plan the week on the calendar or manage every booking in the list below.
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 self-start sm:self-auto"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>New appointment</span>
        </Button>
      </div>

      {/* View Mode Toggle: [ Week calendar | List ] */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5">
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
              viewMode === "calendar"
                ? "bg-accent text-accent-foreground border border-border shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Week calendar</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
              viewMode === "list"
                ? "bg-accent text-accent-foreground border border-border shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* List View Filters matching Image 9 */}
      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <SearchInput
              value={filters.search || ""}
              onChange={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
              placeholder="Search appointments..."
              className="max-w-none sm:max-w-xs"
            />

            <div className="w-full sm:w-44">
              <Select
                value={filters.status || "all"}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: val === "all" ? undefined : (val as Appointment["status"]),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <span className="text-xs font-medium text-muted-foreground text-right shrink-0">
            <strong className="text-foreground">{pagination?.total || appointments.length}</strong>{" "}
            appointments
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="h-80 rounded-xl border bg-card animate-pulse" />
      ) : viewMode === "calendar" ? (
        <AppointmentCalendar
          appointments={appointments}
          onSelectAppointment={handleSelectAppointment}
        />
      ) : (
        <div className="space-y-4">
          <AppointmentTable
            appointments={appointments}
            onEdit={handleSelectAppointment}
            onDelete={(appt) => setDeletingAppointment(appt)}
            onUpdateStatus={handleUpdateStatus}
          />
          {pagination && pagination.totalPages > 1 && (
            <DataTablePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          )}
        </div>
      )}

      {/* Appointment Edit / Create Modal */}
      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editingAppointment}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingAppointment)}
        onOpenChange={(open) => !open && setDeletingAppointment(null)}
        title="Delete appointment"
        description={`Are you sure you want to cancel and remove the appointment for ${deletingAppointment?.patientName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
