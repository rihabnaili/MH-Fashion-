"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Heart, ShoppingCart } from "lucide-react";
import Logo from "../ui/Logo";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCart } from "@/app/context/CartContext";
import LanguageToggle from "../multiLanguage/LanguageToggle";
import SearchModal from "../ui/SearchModal";
import CartModal from "../ui/CartModal";

export default function Header() {
  const t = useTranslations();
  const { lang } = useLanguage();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeSidebar = () => {
    setMobileMenuOpen(false);
  };

  const cartItemCount = getTotalItems();

  return (
    <header className="bg-white fixed shadow-sm border-b border-gray-200 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button + Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-black" />
              ) : (
                <Menu className="w-6 h-6 text-black" />
              )}
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" aria-label={t("home")}>
                <Logo />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {[
              "ensembles",
              "tShirtsPolos", 
              "shortsPantalons",
              "chemises",
            ].map((key) => (
              <Link
                key={key}
                href={`/${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`}
                className="text-black hover:text-gray-600 text-sm font-medium transition-colors"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Search
              className="w-5 h-5 text-black hover:text-gray-600 cursor-pointer"
              onClick={() => setSearchOpen(true)}
            />
            <div className="relative cursor-pointer">
              <ShoppingCart 
                className="w-5 h-5 text-black hover:text-gray-600" 
                onClick={() => setCartOpen(true)}
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Drawer */}
          <div
            ref={mobileMenuRef}
            className="bg-white w-[280px] h-full shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">{t("menu")}</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={t("closeMenu")}
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-4">
              {[
                "ensembles",
                "tShirtsPolos",
                "shortsPantalons",
                "chemises",
                "tousNosProduits",
              ].map((key) => (
                <Link
                  key={key}
                  href={`/${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-black hover:bg-gray-100 text-base font-medium py-4 px-6 transition-colors border-b border-gray-100 w-full"
                >
                  {t(key)}
                </Link>
              ))}
            </div>

          </div>
          
          {/* Overlay */}
          <div className="flex-1 bg-black/20" />
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
