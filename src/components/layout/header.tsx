"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { CommandSearch } from "@/components/shared/command-search";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/appointments") return "Appointments";
    if (pathname === "/doctors") return "Doctors Management";
    if (pathname.startsWith("/doctors/")) return "Doctor Profile";
    if (pathname === "/patients") return "Patients Directory";
    return "Portal";
  };

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-muted-foreground"
          onClick={onOpenMobileMenu}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Trigger Button matching image */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-search"))}
          className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all cursor-pointer text-xs"
          title="Search (Ctrl + K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="font-normal text-muted-foreground">Search</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Dropdown */}
        <UserMenu />
      </div>

      {/* Global Command Search Dialog */}
      <CommandSearch />
    </header>
  );
}

