import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        <Activity className="h-8 w-8" />
      </div>

      <h1 className="text-6xl font-extrabold text-foreground tracking-tight mb-2">
        404
      </h1>

      <h2 className="text-2xl font-bold text-foreground mb-3">
        Page Not Found
      </h2>

      <p className="text-sm text-muted-foreground max-w-md mb-8">
        The clinical route or resource you are trying to access does not exist or may have been moved.
      </p>

      <Link href="/">
        <Button className="font-semibold">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

