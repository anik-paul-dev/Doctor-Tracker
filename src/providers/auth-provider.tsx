"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // Check current session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
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

