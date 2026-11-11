"use client";

import React from "react";
import {
  Stethoscope,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors.toLocaleString(),
      change: stats.doctorGrowthPercent,
      changeText: "vs last month",
      icon: Stethoscope,
      iconColor: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      change: stats.patientGrowthPercent,
      changeText: "vs last month",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
    },
    {
      title: "Patients per Doctor",
      value: stats.averagePatientsPerDoctor.toFixed(1),
      subtitle: "Average clinical load",
      icon: UserCheck,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900",
    },
    {
      title: "New Registrations (Mo.)",
      value: (stats.newPatientsThisMonth + stats.newDoctorsThisMonth).toLocaleString(),
      subtitle: `${stats.newDoctorsThisMonth} Doctors, ${stats.newPatientsThisMonth} Patients`,
      icon: Calendar,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const hasChange = typeof card.change === "number";
        const isPositive = hasChange && (card.change ?? 0) >= 0;

        return (
          <Card key={index} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl border", card.bgColor)}>
                <Icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {card.value}
              </div>
              <div className="mt-2 flex items-center text-xs">
                {hasChange ? (
                  <>
                    <span
                      className={cn(
                        "inline-flex items-center font-semibold mr-1.5 px-1.5 py-0.5 rounded",
                        isPositive
                          ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400"
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 inline" />
                      )}
                      {Math.abs(card.change!)}%
                    </span>
                    <span className="text-muted-foreground">{card.changeText}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground font-medium">
                    {card.subtitle}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

