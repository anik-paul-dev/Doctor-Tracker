"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const sessionRequestRef = useRef<Promise<AuthUser | null> | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check current session on mount
  useEffect(() => {
    const sessionRequest =
      sessionRequestRef.current ??
      fetch("/api/auth/me", { cache: "no-store" })
        .then(async (res) => {
          if (res.status === 204 || !res.ok) return null;
          const json = await res.json();
          return json.success && json.data ? (json.data as AuthUser) : null;
        })
        .catch(() => null);
    sessionRequestRef.current = sessionRequest;

    void sessionRequest.then(setUser).finally(() => setLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Invalid email or password");
        return false;
      }

      setUser(json.data);
      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
      return true;
    } catch {
      toast.error("Failed to connect to authentication service");
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Registration failed");
        return false;
      }

      setUser(json.data);
      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
      return true;
    } catch {
      toast.error("Failed to register. Please try again.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
      queryClient.clear();
      toast.info("Signed out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

