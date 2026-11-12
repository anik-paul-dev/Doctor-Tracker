"use client";

import React, { useEffect, useRef, useState } from "react";
import { SPECIALIZATIONS } from "@/lib/constants";
import { DoctorFilters as FilterType } from "@/types/doctor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  Download,
  LayoutList,
  LayoutGrid,
  X,
} from "lucide-react";

interface DoctorFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onReset: () => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  totalDoctors: number;
  onExport: () => void;
}

export function DoctorFilters({
  filters,
  onFilterChange,
  onReset,
  viewMode,
  onViewModeChange,
  totalDoctors,
  onExport,
}: DoctorFiltersProps) {
  const [datePreset, setDatePreset] = useState<string>("any");
  const [sortValue, setSortValue] = useState<string>("newest");
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const onFilterChangeRef = useRef(onFilterChange);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === (filters.search || "")) return;
    const timer = window.setTimeout(() => {
      onFilterChangeRef.current({ search: searchInput, page: 1 });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, filters.search]);

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
    } else if (val === "patients") {
      onFilterChange({ sortBy: "patientCount", sortOrder: "desc", page: 1 });
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.specialization ||
      filters.startDate ||
      filters.endDate ||
      sortValue !== "newest"
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-2.5 sm:p-3 rounded-xl border border-border/80 shadow-sm">
      {/* Left Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Search input with search icon matching reference */}
        <div className="relative min-w-[180px] sm:w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search doctors..."
            className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Specialization Select */}
        <div className="w-[170px]">
          <Select
            value={filters.specialization || "all"}
            onValueChange={(val) =>
              onFilterChange({
                specialization: val === "all" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60">
              <SelectValue placeholder="All specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All specializations
              </SelectItem>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec} className="text-xs">
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter Dropdown with Calendar Icon matching reference */}
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

        {/* Sort Dropdown */}
        <div className="w-[165px]">
          <Select value={sortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="h-9 text-xs rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60">
              <SelectValue placeholder="Sort: Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="text-xs">
                Sort: Newest first
              </SelectItem>
              <SelectItem value="oldest" className="text-xs">
                Sort: Oldest first
              </SelectItem>
              <SelectItem value="name" className="text-xs">
                Sort: Name (A-Z)
              </SelectItem>
              <SelectItem value="patients" className="text-xs">
                Sort: Most patients
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

      {/* Right Controls: View Switcher, Export, Count Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View Mode Toggle Button Group */}
        <div className="inline-flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/40">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-muted text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Table View"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-muted text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid / Cards View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        {/* Export Button */}
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

        {/* Doctor Count Badge matching reference */}
        <div className="px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 border border-border/60">
          {totalDoctors} {totalDoctors === 1 ? "doctor" : "doctors"}
        </div>
      </div>
    </div>
  );
}
