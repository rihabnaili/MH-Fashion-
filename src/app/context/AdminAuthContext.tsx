'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // The session lives in an httpOnly cookie, so ask the server whether it is valid.
  useEffect(() => {
    // Clean up the old, insecure flag from previous versions.
    try {
      localStorage.removeItem('adminAuthenticated');
    } catch {}

    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setIsAuthenticated(Boolean(data?.authenticated)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsCheckingSession(false));
  }, []);

  // If the session expires while the admin is working, any protected API call returns 401.
  // Send the admin back to the login screen instead of showing confusing errors.
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const input = args[0];
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const path = new URL(url, window.location.origin).pathname;

      if (
        response.status === 401 &&
        (path.startsWith('/api/admin/') || path.startsWith('/api/orders')) &&
        !path.startsWith('/api/admin/session')
      ) {
        setIsAuthenticated(false);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.authenticated) {
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: data?.message };
    } catch {
      return { success: false, message: 'Erreur réseau' };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isCheckingSession, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
