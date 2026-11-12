"use client";

import React, { useState } from "react";
import { PATIENT_CONDITIONS } from "@/lib/constants";
import { PatientFilters as FilterType } from "@/types/patient";
import { Doctor } from "@/types/doctor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Download, X } from "lucide-react";

interface PatientFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onReset: () => void;
  doctors: Doctor[];
  totalPatients: number;
  onExport: () => void;
}

export function PatientFilters({
  filters,
  onFilterChange,
  onReset,
  doctors,
  totalPatients,
  onExport,
}: PatientFiltersProps) {
  const [datePreset, setDatePreset] = useState<string>("any");
  const [sortValue, setSortValue] = useState<string>("newest");

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === "any") {
      onFilterChange({ startDate: undefined, endDate: undefined, page: 1 });
      return;
    }

    if (preset === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      onFilterChange({
        startDate: today.toISOString(),
        endDate: endOfDay.toISOString(),
        page: 1,
      });
      return;
    }

    let daysAgo = 7;
    if (preset === "14d") daysAgo = 14;
    if (preset === "30d") daysAgo = 30;

    if (preset === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      onFilterChange({
        startDate: startOfMonth.toISOString(),
        endDate: now.toISOString(),
        page: 1,
      });
      return;
    }

    const start = new Date(now);
    start.setDate(start.getDate() - daysAgo);
    start.setHours(0, 0, 0, 0);

    onFilterChange({
      startDate: start.toISOString(),
      endDate: now.toISOString(),
      page: 1,
    });
  };

  const handleSortChange = (val: string) => {
    setSortValue(val);
    if (val === "newest") {
      onFilterChange({ sortBy: "createdAt", sortOrder: "desc", page: 1 });
    } else if (val === "oldest") {
      onFilterChange({ sortBy: "createdAt", sortOrder: "asc", page: 1 });
    } else if (val === "name") {
      onFilterChange({ sortBy: "name", sortOrder: "asc", page: 1 });
    } else if (val === "age-desc") {
      onFilterChange({ sortBy: "age", sortOrder: "desc", page: 1 });
    } else if (val === "age-asc") {
      onFilterChange({ sortBy: "age", sortOrder: "asc", page: 1 });
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.condition ||
      filters.doctorId ||
      filters.startDate ||
      filters.endDate ||
      sortValue !== "newest"
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-2.5 sm:p-3 rounded-xl border border-border/80 shadow-sm">
      {/* Left Filter Controls matching Image 3 & 4 */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Search input with Search icon */}
        <div className="relative min-w-[180px] sm:w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Search patients..."
            className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "", page: 1 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Condition Filter */}
        <div className="w-[145px]">
          <Select
            value={filters.condition || "all"}
            onValueChange={(val) =>
              onFilterChange({
                condition: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60">
              <SelectValue placeholder="All conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All conditions
              </SelectItem>
              {PATIENT_CONDITIONS.map((cond) => (
                <SelectItem key={cond} value={cond} className="text-xs">
                  {cond}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Filter Dropdown matching Image 3 & 4 */}
        <div className="w-[160px]">
          <Select
            value={filters.doctorId || "all"}
            onValueChange={(val) =>
              onFilterChange({
                doctorId: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All doctors
              </SelectItem>
              {doctors.map((doc) => (
                <SelectItem key={doc._id} value={doc._id} className="text-xs">
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter Dropdown with Calendar Icon */}
        <div className="w-[130px]">
          <Select value={datePreset} onValueChange={handleDatePresetChange}>
            <SelectTrigger className="h-9 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Any date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any" className="text-xs">
                Any date
              </SelectItem>
              <SelectItem value="today" className="text-xs">
                Today
              </SelectItem>
              <SelectItem value="7d" className="text-xs">
                Last 7 days
              </SelectItem>
              <SelectItem value="14d" className="text-xs">
                Last 14 days
              </SelectItem>
              <SelectItem value="30d" className="text-xs">
                Last 30 days
              </SelectItem>
              <SelectItem value="month" className="text-xs">
                This month
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Dropdown matching Image 3 & 4 */}
        <div className="w-[185px]">
          <Select value={sortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="h-9 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60">
              <SelectValue placeholder="Sort: Newest admissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="text-xs">
                Sort: Newest admissions
              </SelectItem>
              <SelectItem value="oldest" className="text-xs">
                Sort: Oldest admissions
              </SelectItem>
              <SelectItem value="name" className="text-xs">
                Sort: Name (A-Z)
              </SelectItem>
              <SelectItem value="age-desc" className="text-xs">
                Sort: Age (High-Low)
              </SelectItem>
              <SelectItem value="age-asc" className="text-xs">
                Sort: Age (Low-High)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset button if active */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDatePreset("any");
              setSortValue("newest");
              onReset();
            }}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Reset filters"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Right Controls: Export, Count Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Export Button matching Image 3 & 4 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-9 px-3 text-xs font-medium border-border/80 bg-muted/40 hover:bg-muted/70 text-foreground cursor-pointer flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>

        {/* Count Badge matching Image 3 & 4 */}
        <div className="px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 border border-border/60">
          {totalPatients} {totalPatients === 1 ? "patient" : "patients"}
        </div>
      </div>
    </div>
  );
}
