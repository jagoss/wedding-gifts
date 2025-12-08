"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthTokens, User } from "@/core/domain/models";
import { authRepository } from "@/lib/repositories";
import { clearAuth, getStoredToken, getStoredUser, persistAuth } from "@/lib/auth-storage";

type SessionContextValue = {
  user: User | null;
  token: string | null;
  login(email: string, password: string): Promise<AuthTokens>;
  register(name: string, email: string, password: string): Promise<AuthTokens>;
  logout(): void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      token,
      async login(email: string, password: string) {
        const auth = await authRepository.login({ email, password });
        persistAuth(auth);
        setUser(auth.user);
        setToken(auth.accessToken);
        return auth;
      },
      async register(name: string, email: string, password: string) {
        const auth = await authRepository.register({ name, email, password });
        persistAuth(auth);
        setUser(auth.user);
        setToken(auth.accessToken);
        return auth;
      },
      logout() {
        clearAuth();
        setUser(null);
        setToken(null);
      }
    }),
    [user, token]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}

