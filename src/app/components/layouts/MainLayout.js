'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  
  // Check if current page is an admin page
  const isAdminPage = pathname?.startsWith('/admin');

  // If it's an admin page, only render the children without the main site layout
  // The admin layout will handle authentication
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
