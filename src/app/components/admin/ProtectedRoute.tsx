'use client';

import React from 'react';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import PasswordProtection from './PasswordProtection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  return <>{children}</>;
}
