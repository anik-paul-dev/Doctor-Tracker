"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, UserPlus, Trash2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveActivityItem } from "@/types/dashboard";

interface LiveActivityProps {
  items?: LiveActivityItem[];
}

export function LiveActivity({ items = [] }: LiveActivityProps) {
  const defaultItems: LiveActivityItem[] = [
    {
      id: "act-1",
      type: "Created",
      userName: "Alex Morgan",
      description: "Admitted Nabil Noor (STABLE) to the portal",
      timeAgo: "about 2 hours ago",
      createdAt: new Date().toISOString(),
    },
    {
      id: "act-2",
      type: "Deleted",
      userName: "Alex Morgan",
      description: "Removed Nabil Noor from the portal",
      timeAgo: "about 2 hours ago",
      createdAt: new Date().toISOString(),
    },
    {
      id: "act-3",
      type: "Updated",
      userName: "Alex Morgan",
      description: "Updated Maya Das's record (STABLE)",
      timeAgo: "about 2 hours ago",
      createdAt: new Date().toISOString(),
    },
    {
      id: "act-4",
      type: "Updated",
      userName: "Alex Morgan",
      description: "Updated Nabil Noor's record (STABLE)",
      timeAgo: "about 2 hours ago",
      createdAt: new Date().toISOString(),
    },
    {
      id: "act-5",
      type: "Deleted",
      userName: "Alex Morgan",
      description: "Cancelled the appointment of Nabil Noor with Dr. Sajid Anwar",
      timeAgo: "about 2 hours ago",
      createdAt: new Date().toISOString(),
    },
  ];

  const list = items.length > 0 ? items : defaultItems;

  const getTypeStyle = (type: LiveActivityItem["type"]) => {
    switch (type) {
      case "Created":
        return {
          badge: "bg-teal-950/60 text-teal-300 border-teal-800/50",
          iconBg: "bg-teal-950/40 text-teal-400",
          Icon: UserPlus,
        };
      case "Deleted":
        return {
          badge: "bg-rose-950/60 text-rose-300 border-rose-800/50",
          iconBg: "bg-rose-950/40 text-rose-400",
          Icon: Trash2,
        };
      case "Updated":
      default:
        return {
          badge: "bg-amber-950/60 text-amber-300 border-amber-800/50",
          iconBg: "bg-amber-950/40 text-amber-400",
          Icon: Edit3,
        };
    }
  };

  return (
    <Card className="border shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-400 shrink-0" />
            <CardTitle className="text-base font-semibold text-foreground">
              Live Activity
            </CardTitle>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Latest changes across doctors, patients and appointments.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1 pb-4 flex-1">
        <div className="divide-y divide-border/40">
          {list.map((item) => {
            const { badge, iconBg, Icon } = getTypeStyle(item.type);

            return (
              <div
                key={item.id}
                className="flex items-start justify-between py-3 hover:bg-muted/20 px-2 rounded-md transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5 shadow-sm",
                      iconBg
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold border",
                          badge
                        )}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {item.userName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                  {item.timeAgo}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
