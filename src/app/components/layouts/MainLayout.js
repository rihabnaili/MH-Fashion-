'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import TopBanner from './TopBanner';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if current page is an admin page
  const isAdminPage = pathname?.startsWith('/admin');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // If it's an admin page, only render the children without the main site layout
  // The admin layout will handle authentication
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fcf7f2]">
      {/* <TopBanner /> */}
      <Header onMenuToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
