'use client';

import React from 'react';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import PasswordProtection from './PasswordProtection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isCheckingSession } = useAdminAuth();

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  return <>{children}</>;
}
