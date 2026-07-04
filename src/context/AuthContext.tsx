import React, { createContext, useState, useEffect, useCallback } from 'react';

interface Admin {
  id: string;
  email: string;
}

export interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_TOKEN_KEY = 'portfolio_refresh_token';

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = decodeJwtExp(token);
  if (exp === null) return true;
  return Date.now() / 1000 >= exp - 30;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyTokens = (access: string, refresh: string, adminData: Admin) => {
    setAccessToken(access);
    setAdmin(adminData);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  };

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setAdmin(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearAuth();
        return null;
      }
      const data = await res.json();
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  useEffect(() => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    refreshAccessToken(stored).then((token) => {
      if (token) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => setAdmin(data))
          .catch(() => {});
      }
      setIsLoading(false);
    });
  }, [refreshAccessToken]);

  useEffect(() => {
    if (!accessToken) return;
    const exp = decodeJwtExp(accessToken);
    if (!exp) return;

    const msUntilRefresh = (exp - Date.now() / 1000 - 60) * 1000;
    if (msUntilRefresh <= 0) return;

    const timer = setTimeout(() => {
      const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (stored) refreshAccessToken(stored);
    }, msUntilRefresh);

    return () => clearTimeout(timer);
  }, [accessToken, refreshAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Erro ao fazer login');
    }

    const data = await res.json();
    applyTokens(data.accessToken, data.refreshToken, data.admin);
  }, []);

  const logout = useCallback(async () => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (accessToken && stored) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken: stored }),
      }).catch(() => {});
    }
    clearAuth();
  }, [accessToken, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: !!accessToken && !isTokenExpired(accessToken),
        isLoading,
        admin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
