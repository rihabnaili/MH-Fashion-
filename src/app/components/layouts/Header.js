"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Logo from "../ui/Logo";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCart } from "@/app/context/CartContext";
import LanguageToggle from "../multiLanguage/LanguageToggle";
import SearchModal from "../ui/SearchModal";
import CartModal from "../ui/CartModal";

const navigationItems = [
  { key: "ensembles", href: "/ensembles" },
  { key: "tShirtsPolos", href: "/t-shirts-polos" },
  { key: "shortsPantalons", href: "/shorts-pantalons" },
  { key: "chemises", href: "/chemises" },
  { key: "tousNosProduits", href: "/tous-nos-produits" },
];

export default function Header() {
  const t = useTranslations();
  const { isRTL } = useLanguage();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartItemCount = getTotalItems();

  return (
    <header
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-x-0 top-0 z-50 border-b border-[#eadbcc] bg-[#fffaf5]/92 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#decbbb] bg-white/90 text-[#3c281b] shadow-[0_18px_35px_-26px_rgba(65,37,18,0.55)] transition-colors hover:border-[#bc916f] lg:hidden"
              aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" aria-label={t("home")}>
              <Logo />
            </Link>
          </div>

          <nav className="hidden items-center gap-6 text-[0.92rem] font-medium text-[#4f392c] lg:flex xl:gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="transition-colors hover:text-[#9a7253]"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#decbbb] bg-white/90 text-[#3c281b] shadow-[0_18px_35px_-26px_rgba(65,37,18,0.55)] transition-colors hover:border-[#bc916f]"
              aria-label={t("search")}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#decbbb] bg-white/90 text-[#3c281b] shadow-[0_18px_35px_-26px_rgba(65,37,18,0.55)] transition-colors hover:border-[#bc916f]"
              aria-label={t("cart")}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#a96f4f] text-[0.68rem] text-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            <LanguageToggle />
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-[#1d130b]/25 backdrop-blur-[2px]" />
          <div
            ref={mobileMenuRef}
            className={`absolute inset-y-0 ${
              isRTL ? "right-0" : "left-0"
            } h-full w-[86vw] max-w-sm overflow-y-auto bg-[#fffaf5] px-5 pb-8 pt-6 shadow-[0_30px_80px_-45px_rgba(36,22,13,0.65)]`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#eadbcc] pb-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#decbbb] bg-white text-[#3c281b] transition-colors hover:border-[#bc916f]"
                aria-label={t("closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-6">
              <p className="mb-4 text-xs uppercase tracking-[0.34em] text-[#9b7456]">
                {t("menu")}
              </p>
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-2xl border border-transparent px-4 py-3 text-base font-medium text-[#2f1d12] transition-colors hover:border-[#eadbcc] hover:bg-white"
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
