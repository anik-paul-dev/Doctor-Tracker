"use client";

import React from "react";
import { SPECIALIZATIONS } from "@/lib/constants";
import { DoctorFilters as FilterType } from "@/types/doctor";
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

interface DoctorFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onReset: () => void;
}

export function DoctorFilters({
  filters,
  onFilterChange,
  onReset,
}: DoctorFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.specialization ||
      filters.hospital ||
      filters.startDate ||
      filters.endDate
  );

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-card p-3.5 rounded-xl border shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        <SearchInput
          value={filters.search || ""}
          onChange={(search) => onFilterChange({ search, page: 1 })}
          placeholder="Search by name, hospital, phone, specialization..."
          className="max-w-none sm:max-w-xs"
        />

        <div className="w-full sm:w-48">
          <Select
            value={filters.specialization || "all"}
            onValueChange={(val) =>
              onFilterChange({
                specialization: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
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

