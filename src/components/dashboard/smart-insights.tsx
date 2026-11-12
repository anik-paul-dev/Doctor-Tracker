"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Siren, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SmartInsightItem } from "@/types/dashboard";

interface SmartInsightsProps {
  items?: SmartInsightItem[];
}

export function SmartInsights({ items = [] }: SmartInsightsProps) {
  const router = useRouter();

  const getStyle = (type: SmartInsightItem["type"]) => {
    switch (type) {
      case "critical":
        return {
          border: "border-l-rose-500",
          iconBg: "bg-rose-950/50 text-rose-400 border border-rose-800/40",
          Icon: Siren,
        };
      case "warning":
        return {
          border: "border-l-amber-500",
          iconBg: "bg-amber-950/50 text-amber-400 border border-amber-800/40",
          Icon: AlertTriangle,
        };
      case "success":
      default:
        return {
          border: "border-l-emerald-500",
          iconBg: "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40",
          Icon: CheckCircle2,
        };
    }
  };

  return (
    <Card className="border shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-400 shrink-0" />
          <CardTitle className="text-base font-semibold text-foreground">
            Smart Insights
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Rule-based operational alerts
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-6 space-y-3 flex-1 flex flex-col justify-center">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No insights from the current records.</p>
        ) : items.map((item) => {
          const { border, iconBg, Icon } = getStyle(item.type);

          return (
            <div
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                "group flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer border-l-4 shadow-sm",
                border
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm",
                    iconBg
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

