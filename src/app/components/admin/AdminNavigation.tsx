'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { LogOut, Shield, Package, Plus, ShoppingCart, Home, Menu, X, BarChart3, Handshake } from 'lucide-react';

interface AdminNavigationProps {
  children: React.ReactNode;
}

export default function AdminNavigation({ children }: AdminNavigationProps) {
  const { logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Admin Navigation */}
      <nav className="bg-black shadow-sm border-b border-gold">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                <Link 
                  href="/admin" 
                  className="text-lg sm:text-xl font-bold text-gold font-montserrat"
                  onClick={closeMobileMenu}
                >
                  MH Fashion Admin
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="text-offwhite hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Produits</span>
              </Link>
              <Link
                href="/admin/orders"
                className="text-offwhite hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Commandes</span>
              </Link>
              <Link
                href="/admin/statistics"
                className="text-offwhite hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistiques</span>
              </Link>
              <Link
                href="/admin/sponsors"
                className="text-offwhite hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Handshake className="w-4 h-4" />
                <span>Sponsoring</span>
              </Link>
              <Link
                href="/admin/product/addNew/form"
                className="bg-gold text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter Produit</span>
              </Link>
              <Link
                href="/"
                className="text-offwhite hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Retour au Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-offwhite hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-offwhite hover:text-gold p-2 rounded-md transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gold/20">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/admin/products"
                  className="text-offwhite hover:text-gold block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={closeMobileMenu}
                >
                  <Package className="w-5 h-5" />
                  <span>Produits</span>
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-offwhite hover:text-gold block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Commandes</span>
                </Link>
                <Link
                  href="/admin/statistics"
                  className="text-offwhite hover:text-gold block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={closeMobileMenu}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Statistiques</span>
                </Link>
                <Link
                  href="/admin/sponsors"
                  className="text-offwhite hover:text-gold block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={closeMobileMenu}
                >
                  <Handshake className="w-5 h-5" />
                  <span>Sponsoring</span>
                </Link>
                <Link
                  href="/admin/product/addNew/form"
                  className="bg-gold text-black block px-3 py-2 rounded-md text-base font-medium hover:bg-yellow-600 transition-colors duration-200 flex items-center space-x-3"
                  onClick={closeMobileMenu}
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter Produit</span>
                </Link>
                <Link
                  href="/"
                  className="text-offwhite hover:text-gold block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={closeMobileMenu}
                >
                  <Home className="w-5 h-5" />
                  <span>Retour au Site</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full text-left flex items-center space-x-3 text-offwhite hover:text-red-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
