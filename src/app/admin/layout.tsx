'use client';

import React from 'react';
import { AdminAuthProvider } from '@/app/context/AdminAuthContext';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import AdminNavigation from '@/app/components/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <ProtectedRoute>
        <AdminNavigation>{children}</AdminNavigation>
      </ProtectedRoute>
    </AdminAuthProvider>
  );
}
