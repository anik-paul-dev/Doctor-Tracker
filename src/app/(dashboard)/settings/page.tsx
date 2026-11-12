"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  User,
  KeyRound,
  Bell,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();

  // Profile Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preference Toggles state
  const [alertCritical, setAlertCritical] = useState(true);
  const [alertSpike, setAlertSpike] = useState(true);
  const [alertDaily, setAlertDaily] = useState(true);
  const [alertAudit, setAlertAudit] = useState(true);
  const [prefLoading, setPrefLoading] = useState(false);

  // Sync initial user details when auth loads
  React.useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update profile");
      }

      toast.success("Profile information updated successfully");
      // Optionally reload or re-sync session
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update password");
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = () => {
    setPrefLoading(true);
    setTimeout(() => {
      setPrefLoading(false);
      toast.success("Clinical notification preferences saved");
    }, 400);
  };

  const initials = getInitials(user?.name || name || "A");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Profile Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your administrative credentials, security preferences, and portal configuration
          </p>
        </div>
      </div>

      {/* Top Profile Summary Card */}
      <Card className="border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="h-20 bg-gradient-to-r from-teal-900/60 via-slate-900/80 to-teal-950/60 border-b border-border/60" />
        <CardContent className="relative pt-0 pb-6 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-card rounded-2xl shadow-md bg-teal-950/90 text-teal-300">
                <AvatarFallback className="text-xl font-bold bg-teal-950 text-teal-300">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {user?.name || name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800/80">
                    {user?.role || "Admin"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 inline text-muted-foreground" />
                  {user?.email || email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground sm:pb-1">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
              <span>·</span>
              <span>Role: Hospital Administrator</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Edit Profile Details */}
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-950/70 border border-teal-800/80 text-teal-300">
                <User className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  Account Information
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Update your display name and login email address
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name" className="text-xs font-semibold">
                  Full Name
                </Label>
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@doctortracker.com"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Administrative Role
                  </Label>
                  <div className="h-9 px-3 rounded-lg border border-border/80 bg-muted/40 text-xs font-medium flex items-center text-muted-foreground">
                    {user?.role ? user.role.toUpperCase() : "ADMIN"}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Affiliation
                  </Label>
                  <div className="h-9 px-3 rounded-lg border border-border/80 bg-muted/40 text-xs font-medium flex items-center text-muted-foreground">
                    Doctor Tracker Clinical
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-border/60 flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={profileLoading}
                className="text-xs font-semibold h-9"
              >
                {profileLoading && (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                )}
                Save Account Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Form 2: Password & Security */}
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-950/70 border border-teal-800/80 text-teal-300">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  Security & Password
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Update administrative authentication credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pass" className="text-xs font-semibold">
                  Current Password
                </Label>
                <Input
                  id="current-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs font-semibold">
                  New Password
                </Label>
                <Input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" className="text-xs font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-border/60 flex justify-end">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={passwordLoading}
                className="text-xs font-semibold h-9"
              >
                {passwordLoading && (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                )}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Form 3: Notification & Operational Preferences */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-950/70 border border-teal-800/80 text-teal-300">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Clinical Operational Alert Preferences
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Configure real-time notifications for hospital acuity and practitioner schedules
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle 1 */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/70 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  Critical Patient Acuity Alerts
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Notify immediately when a patient enters Critical or Serious status.
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertCritical}
                onChange={(e) => setAlertCritical(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer mt-0.5 accent-teal-600"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/70 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  Admission Spike Monitoring
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Alert when weekly admissions increase by more than 25%.
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertSpike}
                onChange={(e) => setAlertSpike(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer mt-0.5 accent-teal-600"
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/70 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  Daily Appointment Schedule Digest
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Receive roster allocation and room schedule summaries each morning.
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertDaily}
                onChange={(e) => setAlertDaily(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer mt-0.5 accent-teal-600"
              />
            </div>

            {/* Toggle 4 */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/70 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  Audit Trail Event Logging
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Broadcast live admission, discharge, and practitioner assignment updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertAudit}
                onChange={(e) => setAlertAudit(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer mt-0.5 accent-teal-600"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-border/60 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSavePreferences}
            disabled={prefLoading}
            className="text-xs font-semibold h-9"
          >
            {prefLoading && (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            )}
            Save Alert Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
