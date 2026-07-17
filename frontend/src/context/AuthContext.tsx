"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

interface User {
  email: string;
  name: string;
  subscriptionTier: string;
  generationsUsed: number;
  generationsLimit: number;
}

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.me();
      setUser(res.data);
    } catch {
      logout();
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

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

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
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
