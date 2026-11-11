"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutDashboard,
  Stethoscope,
  Users,
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface DoctorResult {
  _id: string;
  name: string;
  hospital: string;
  specialization?: string;
}

interface PatientResult {
  _id: string;
  name: string;
  condition: string;
}

const CONDITION_DOT_STYLES: Record<string, { pill: string; dot: string }> = {
  Critical: {
    pill: "bg-rose-950/40 text-rose-300 border-rose-800/40",
    dot: "bg-rose-500",
  },
  Serious: {
    pill: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    dot: "bg-amber-400",
  },
  Stable: {
    pill: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
    dot: "bg-emerald-400",
  },
  Recovering: {
    pill: "bg-teal-950/40 text-teal-300 border-teal-800/40",
    dot: "bg-teal-400",
  },
  Discharged: {
    pill: "bg-slate-900/40 text-slate-300 border-slate-700/40",
    dot: "bg-slate-400",
  },
};

const DEFAULT_DOT_STYLE = {
  pill: "bg-muted text-muted-foreground border-border",
  dot: "bg-muted-foreground",
};

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState<DoctorResult[]>([]);
  const [patients, setPatients] = useState<PatientResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // All selectable items list
  const items: Array<{
    type: "nav" | "doctor" | "patient" | "action";
    id: string;
    label: string;
    action: () => void;
  }> = [];

  // 1. Navigation items
  items.push({
    type: "nav",
    id: "nav-dashboard",
    label: "Dashboard",
    action: () => navigate("/"),
  });
  items.push({
    type: "nav",
    id: "nav-doctors",
    label: "Doctors",
    action: () => navigate("/doctors"),
  });
  items.push({
    type: "nav",
    id: "nav-patients",
    label: "Patients",
    action: () => navigate("/patients"),
  });

  // 2. Doctor results
  doctors.forEach((d) =>
    items.push({
      type: "doctor",
      id: d._id,
      label: d.name,
      action: () => navigate(`/doctors/${d._id}`),
    })
  );

  // 3. Patient results
  patients.forEach((p) =>
    items.push({
      type: "patient",
      id: p._id,
      label: p.name,
      action: () => navigate("/patients"),
    })
  );

  // 4. Actions
  items.push({
    type: "action",
    id: "action-theme",
    label: "Toggle theme",
    action: () => setTheme(theme === "dark" ? "light" : "dark"),
  });
  items.push({
    type: "action",
    id: "action-logout",
    label: "Sign out",
    action: () => logout(),
  });

  const fetchResults = useCallback(async (q: string) => {
    try {
      const searchParam = q.trim() ? `search=${encodeURIComponent(q.trim())}&limit=5` : "limit=4";
      const patParam = q.trim() ? `search=${encodeURIComponent(q.trim())}&limit=6` : "limit=6";
      const [docRes, patRes] = await Promise.all([
        fetch(`/api/doctors?${searchParam}`),
        fetch(`/api/patients?${patParam}`),
      ]);
      const docJson = await docRes.json();
      const patJson = await patRes.json();
      if (docJson.success) setDoctors(docJson.data?.doctors || docJson.data || []);
      if (patJson.success) setPatients(patJson.data?.patients || patJson.data || []);
    } catch {
      // silently fail search
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // Load initial doctors & patients on open
  useEffect(() => {
    if (open) {
      fetchResults("");
    }
  }, [open, fetchResults]);

  // Global Ctrl+K / Cmd+K and custom event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-search", handleCustomOpen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-search", handleCustomOpen);
    };
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < items.length) {
      e.preventDefault();
      items[activeIndex].action();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[540px] p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search doctors, patients or jump to a page..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
          {/* Navigation Section */}
          <div>
            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground tracking-wide">
              Navigation
            </p>
            <div className="space-y-0.5">
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeIndex === 0
                    ? "bg-accent/80 text-accent-foreground font-semibold"
                    : "text-foreground hover:bg-muted/60"
                }`}
                onClick={() => navigate("/")}
                onMouseEnter={() => setActiveIndex(0)}
              >
                <LayoutDashboard className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Dashboard</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeIndex === 1
                    ? "bg-accent/80 text-accent-foreground font-semibold"
                    : "text-foreground hover:bg-muted/60"
                }`}
                onClick={() => navigate("/doctors")}
                onMouseEnter={() => setActiveIndex(1)}
              >
                <Stethoscope className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Doctors</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeIndex === 2
                    ? "bg-accent/80 text-accent-foreground font-semibold"
                    : "text-foreground hover:bg-muted/60"
                }`}
                onClick={() => navigate("/patients")}
                onMouseEnter={() => setActiveIndex(2)}
              >
                <Users className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Patients</span>
              </button>
            </div>
          </div>

          {/* Doctor Results Section */}
          {doctors.length > 0 && (
            <div className="pt-2 border-t border-border/40">
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground tracking-wide">
                Doctors
              </p>
              <div className="space-y-0.5">
                {doctors.map((doc, i) => {
                  const idx = 3 + i;
                  return (
                    <button
                      key={doc._id}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeIndex === idx
                          ? "bg-accent/80 text-accent-foreground font-medium"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                      onClick={() => navigate(`/doctors/${doc._id}`)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-950/80 border border-teal-800/60 text-teal-300 text-xs font-bold">
                        {getInitials(doc.name)}
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="font-semibold text-foreground text-sm truncate">
                          {doc.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {doc.hospital}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patient Results Section */}
          {patients.length > 0 && (
            <div className="pt-2 border-t border-border/40">
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground tracking-wide">
                Patients
              </p>
              <div className="space-y-0.5">
                {patients.map((pat, i) => {
                  const idx = 3 + doctors.length + i;
                  const dotStyle = CONDITION_DOT_STYLES[pat.condition] || DEFAULT_DOT_STYLE;
                  return (
                    <button
                      key={pat._id}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeIndex === idx
                          ? "bg-accent/80 text-accent-foreground font-medium"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                      onClick={() => navigate("/patients")}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground text-sm truncate">
                          {pat.name}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0 ml-2",
                          dotStyle.pill
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", dotStyle.dot)} />
                        {pat.condition}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="pt-2 border-t border-border/40">
            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground tracking-wide">
              Actions
            </p>
            <div className="space-y-0.5">
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeIndex === 3 + doctors.length + patients.length
                    ? "bg-accent/80 text-accent-foreground font-medium"
                    : "text-foreground hover:bg-muted/60"
                }`}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                onMouseEnter={() => setActiveIndex(3 + doctors.length + patients.length)}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span>Toggle theme</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors ${
                  activeIndex === 4 + doctors.length + patients.length
                    ? "bg-destructive/15 text-destructive font-medium"
                    : ""
                }`}
                onClick={() => logout()}
                onMouseEnter={() => setActiveIndex(4 + doctors.length + patients.length)}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground bg-muted/10">
          <span>
            Signed in as{" "}
            <span className="font-semibold text-foreground">
              {user?.name || "Alex Morgan"}
            </span>
          </span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="rounded bg-muted px-1 py-0.5 text-[10px]">↑↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">↵</span>
              Open
            </span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Esc</span>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

