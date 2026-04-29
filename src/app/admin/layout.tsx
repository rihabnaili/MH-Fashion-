import type { Metadata } from 'next';
import React from 'react';

import AdminShell from './AdminShell';

export const metadata: Metadata = {
  title: 'Administration - MH Fashion',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
