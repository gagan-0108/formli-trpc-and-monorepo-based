"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, setToken as storeToken, removeToken } from "~/lib/auth";
import { trpc } from "~/trpc/client";

interface User {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

  // Check for existing token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Verify the token
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/trpc/auth.me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.result?.data) {
            setUser(data.result.data);
          } else {
            removeToken();
          }
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation.mutateAsync({ email, password });
      storeToken(result.token);
      setUser(result.user);
    },
    [loginMutation]
  );

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      const result = await signupMutation.mutateAsync({ email, password, fullName });
      storeToken(result.token);
      setUser(result.user);
    },
    [signupMutation]
  );

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
