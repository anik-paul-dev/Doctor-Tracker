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
import { Activity, ShieldCheck, UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await registerAuth({ name, email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden border bg-card shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        {/* Left Visual Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

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
              Admin Provisioning
            </p>
          </div>

          <div className="relative z-10 space-y-6 my-12">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Create an Administrator Account for Your Medical Facility.
            </h2>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Full Administrative Privileges
                  </h4>
                  <p className="text-xs text-teal-100/70">
                    Manage practitioner rosters, assign patient cases, and review statistics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Instant Workspace Activation
                  </h4>
                  <p className="text-xs text-teal-100/70">
                    Immediately access the dashboard with pre-populated or customized seed data.
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                    Register Admin
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Set up a new administrator credential
                  </CardDescription>
                </div>
                <div className="lg:hidden h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Chief Admin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold mt-2"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </CardContent>

            <CardFooter className="px-0 pb-0 flex flex-col space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

