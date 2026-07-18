"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authAPI } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.me();
      setUser(res.data);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    }
    init();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const data = res.data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      email: data.email,
      name: data.name,
      subscriptionTier: data.subscriptionTier,
      generationsUsed: data.generationsUsed,
      generationsLimit: data.generationsLimit,
    });
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authAPI.register(name, email, password);
    const data = res.data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      email: data.email,
      name: data.name,
      subscriptionTier: data.subscriptionTier,
      generationsUsed: data.generationsUsed,
      generationsLimit: data.generationsLimit,
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
