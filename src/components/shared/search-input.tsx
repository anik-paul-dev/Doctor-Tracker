"use client";

import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  value: initialValue,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [value, initialValue, onChange, debounceMs]);

  return (
    <div className={cn("relative flex items-center w-full max-w-sm", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-10 w-full"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onChange("");
          }}
          className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}

