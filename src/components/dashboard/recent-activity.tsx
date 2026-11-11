"use client";

import React from "react";
import { Stethoscope, User, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentActivity as RecentActivityType } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/utils";

interface RecentActivityProps {
  activities: RecentActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-full border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Recent System Activity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Latest additions of doctors and registered patients
            </CardDescription>
          </div>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No recent activity recorded yet
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((item) => {
              const isDoctor = item.type === "doctor";
              const Icon = isDoctor ? Stethoscope : User;

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                        isDoctor
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isDoctor ? "default" : "secondary"}
                      className="text-[10px] capitalize font-medium"
                    >
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

