"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="From"
          className="h-10 pl-8 text-xs w-[135px]"
          title="Start date"
        />
      </div>
      <span className="text-muted-foreground text-xs">to</span>
      <div className="relative flex items-center">
        <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="To"
          className="h-10 pl-8 text-xs w-[135px]"
          title="End date"
        />
      </div>
    </div>
  );
}

