"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Users,
  Activity,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Doctors",
    href: "/doctors",
    icon: Stethoscope,
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r bg-card h-screen sticky top-0 select-none z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-foreground">
            Doctor Tracker
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <Link
              href="/settings"
              className="flex items-center gap-3 overflow-hidden group hover:opacity-85 transition-opacity flex-1 min-w-0"
              title="View Profile Settings"
            >
              <Avatar className="h-9 w-9 border border-border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {getInitials(user.name || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
              onClick={() => logout()}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
