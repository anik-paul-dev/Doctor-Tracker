"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, ShieldCheck, BarChart3, Users, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login({ email, password });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@doctortracker.com");
    setPassword("password123");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden border bg-card shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        {/* Left Visual Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Activity className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Doctor Tracker
              </span>
            </div>
            <p className="mt-2 text-xs text-teal-200/80 uppercase font-semibold tracking-wider">
              Clinical Administration & Analytics
            </p>
          </div>

          {/* Middle Value Props */}
          <div className="relative z-10 space-y-6 my-12">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Manage Medical Practitioners & Patient Records with Confidence.
            </h2>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Secure Administrative Access
                  </h4>
                  <p className="text-xs text-teal-100/70">
                    Protected with JWT in secure httpOnly cookies & password hashing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Data Visualization & Load Distribution
                  </h4>
                  <p className="text-xs text-teal-100/70">
                    Interactive charts for patient volume and doctor specialty trends.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    High-Performance Pagination & Search
                  </h4>
                  <p className="text-xs text-teal-100/70">
                    Instant sub-string search, indexing, and multi-criteria filters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 pt-6 border-t border-teal-700/50 text-xs text-teal-200/60 flex items-center justify-between">
            <span>Interview Demonstration Build</span>
            <span>Version 1.0.0</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Enter your administrative credentials to access the portal
                  </CardDescription>
                </div>
                <div className="lg:hidden h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@doctortracker.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                {/* Quick Fill Button for Interview Review */}
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillDemoCredentials}
                    className="w-full text-xs text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Auto-Fill Demo Admin Credentials
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold mt-2"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In to Dashboard
                </Button>
              </form>
            </CardContent>

            <CardFooter className="px-0 pb-0 flex flex-col space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an administrator account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  Create one now
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

