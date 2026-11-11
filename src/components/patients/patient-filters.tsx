"use client";

import React from "react";
import { PATIENT_CONDITIONS } from "@/lib/constants";
import { PatientFilters as FilterType } from "@/types/patient";
import { SearchInput } from "@/components/shared/search-input";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface PatientFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onReset: () => void;
}

export function PatientFilters({
  filters,
  onFilterChange,
  onReset,
}: PatientFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.condition ||
      filters.startDate ||
      filters.endDate
  );

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-card p-3.5 rounded-xl border shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        <SearchInput
          value={filters.search || ""}
          onChange={(search) => onFilterChange({ search, page: 1 })}
          placeholder="Search by patient name, condition, contact..."
          className="max-w-none sm:max-w-xs"
        />

        <div className="w-full sm:w-48">
          <Select
            value={filters.condition || "all"}
            onValueChange={(val) =>
              onFilterChange({
                condition: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {PATIENT_CONDITIONS.map((cond) => (
                <SelectItem key={cond} value={cond}>
                  {cond}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(startDate) =>
            onFilterChange({ startDate: startDate || undefined, page: 1 })
          }
          onEndDateChange={(endDate) =>
            onFilterChange({ endDate: endDate || undefined, page: 1 })
          }
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 text-xs text-muted-foreground hover:text-foreground"
            title="Reset filters"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

