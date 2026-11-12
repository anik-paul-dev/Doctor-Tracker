"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Activity,
  HeartPulse,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning" | "appointment" | "success" | "info";
  href: string;
  read: boolean;
  category: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "8 Critical Patients Need Attention",
    message: "ICU vitals require clinical review and escalation across rosters.",
    time: "10m ago",
    type: "critical",
    href: "/patients?condition=Critical",
    read: false,
    category: "Acuity Alert",
  },
  {
    id: "notif-2",
    title: "Admission Spike This Week",
    message: "20 admissions vs 8 last week — clinical staffing adjustment recommended.",
    time: "35m ago",
    type: "warning",
    href: "/patients",
    read: false,
    category: "Capacity",
  },
  {
    id: "notif-3",
    title: "Upcoming Appointment at 3:00 PM",
    message: "Lubna Das with Dr. Rahim Uddin in Room 209 (Radiology consultation).",
    time: "1h ago",
    type: "appointment",
    href: "/appointments",
    read: false,
    category: "Schedule",
  },
  {
    id: "notif-4",
    title: "Dr. Sajid Anwar Added to Roster",
    message: "New ENT specialist assigned to Popular Diagnostic Centre.",
    time: "2h ago",
    type: "info",
    href: "/doctors",
    read: false,
    category: "Practitioners",
  },
  {
    id: "notif-5",
    title: "1 Discharge Processed Today",
    message: "Bed freed up in general ward following successful stabilization.",
    time: "3h ago",
    type: "success",
    href: "/patients?condition=Discharged",
    read: false,
    category: "Discharge",
  },
  {
    id: "notif-6",
    title: "Appointment Confirmed at 4:15 PM",
    message: "Tasnim Alam confirmed attendance with Dr. Rahim Uddin (Room 267).",
    time: "4h ago",
    type: "appointment",
    href: "/appointments",
    read: false,
    category: "Schedule",
  },
  {
    id: "notif-7",
    title: "Caseload Threshold Alert",
    message: "Dr. Nusrat Jahan currently managing 8 active assigned patients.",
    time: "5h ago",
    type: "warning",
    href: "/doctors",
    read: false,
    category: "Caseload",
  },
  {
    id: "notif-8",
    title: "Composite Clinic Health at 61/100",
    message: "Clinical efficiency index requires review due to high acute patient ratio.",
    time: "Today",
    type: "critical",
    href: "/",
    read: false,
    category: "Health Index",
  },
];

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [tab, setTab] = useState<"all" | "unread">("all");
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setOpen(false);
    router.push(item.href);
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-cyan-400" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "info":
        return <Stethoscope className="h-4 w-4 text-purple-400" />;
      default:
        return <Activity className="h-4 w-4 text-teal-400" />;
    }
  };

  const getTypeBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "critical":
        return "bg-rose-950/60 border-rose-800/80 text-rose-300";
      case "warning":
        return "bg-amber-950/60 border-amber-800/80 text-amber-300";
      case "appointment":
        return "bg-cyan-950/60 border-cyan-800/80 text-cyan-300";
      case "success":
        return "bg-emerald-950/60 border-emerald-800/80 text-emerald-300";
      case "info":
        return "bg-purple-950/60 border-purple-800/80 text-purple-300";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Red Unread Badge matching Image 1 */}
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[410px] p-0 rounded-xl border border-border/80 bg-card shadow-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">
              Clinical Alerts & Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Read all
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                title="Clear all alerts"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-3.5 py-2 border-b border-border/50 bg-muted/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                tab === "all"
                  ? "bg-muted text-foreground shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("unread")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                tab === "unread"
                  ? "bg-muted text-foreground shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span className="text-[11px] text-muted-foreground">
            Live auto-feed
          </span>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
          {filteredNotifications.length === 0 ? (
            <div className="py-10 px-4 text-center text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-teal-500/60" />
              <p className="text-sm font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No active notifications in this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={cn(
                  "p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative",
                  !item.read
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted/40 opacity-80"
                )}
              >
                {/* Type Icon */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs mt-0.5",
                    getTypeBg(item.type)
                  )}
                >
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "text-xs truncate",
                        !item.read
                          ? "font-bold text-foreground"
                          : "font-semibold text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                    {!item.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span className="px-1.5 py-0.2 rounded bg-muted border border-border/60 font-medium">
                      {item.category}
                    </span>
                    <span>·</span>
                    <span>{item.time}</span>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => handleDismiss(e, item.id)}
                  className="absolute right-2.5 top-3 p-1 rounded-md text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-border/70 bg-muted/30 text-center">
          <p className="text-[11px] text-muted-foreground">
            Clicking an alert navigates directly to patient or schedule details
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
