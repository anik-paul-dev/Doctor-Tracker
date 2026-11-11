import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TableSkeleton({
  rows = 5,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="rounded-lg border bg-card">
        <div className="h-12 border-b px-4 flex items-center space-x-4 bg-muted/40">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="h-16 px-4 flex items-center space-x-4">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={c} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

