'use client';

import React from 'react';

import AdminNavigation from '@/app/components/admin/AdminNavigation';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import { AdminAuthProvider } from '@/app/context/AdminAuthContext';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ProtectedRoute>
        <AdminNavigation>{children}</AdminNavigation>
      </ProtectedRoute>
    </AdminAuthProvider>
  );
}
