"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";

import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTranslations } from "@/app/hooks/useTranslations";

import LanguageToggle from "../multiLanguage/LanguageToggle";
import CartModal from "../ui/CartModal";
import Logo from "../ui/Logo";

const navigationItems = [
  { key: "tousNosProduits", href: "/tous-nos-produits" },
  { key: "contact", href: "/contact" },
];

function SearchForm({
  query,
  setQuery,
  onSubmit,
  t,
  isCompact = false,
}) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <label className="sr-only" htmlFor={isCompact ? "mobile-header-search" : "header-search"}>
        {t("search")}
      </label>
      <div className="flex items-center rounded-full border border-[#d8d8d8] bg-[#f7f7f7] px-3">
        <Search className="h-4 w-4 shrink-0 text-[#666666]" />
        <input
          id={isCompact ? "mobile-header-search" : "header-search"}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className={`w-full border-0 bg-transparent text-[#111111] placeholder:text-[#7b7b7b] focus:outline-none focus:ring-0 ${
            isCompact ? "px-2 py-3 text-sm" : "px-2 py-2.5 text-sm"
          }`}
        />
      </div>
    </form>
  );
}

export default function Header() {
  const t = useTranslations();
  const { isRTL } = useLanguage();
  const { getTotalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileMenuRef = useRef(null);

  const cartItemCount = getTotalItems();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const activeSearch =
      pathname === "/tous-nos-produits"
        ? new URLSearchParams(window.location.search).get("search") || ""
        : "";
    setSearchQuery(activeSearch);
  }, [pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    const target = trimmedQuery
      ? `/tous-nos-produits?search=${encodeURIComponent(trimmedQuery)}`
      : "/tous-nos-produits";

    setMobileMenuOpen(false);
    router.push(target);
  };

  return (
    <>
      <header
        dir={isRTL ? "rtl" : "ltr"}
        className="fixed inset-x-0 top-0 z-50 border-b border-[#e3e3e3] bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:h-[72px]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d7d7] bg-white text-[#111111] transition-colors hover:border-black lg:hidden"
                aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link href="/" aria-label={t("home")} className="shrink-0">
                <Logo />
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
              <div className="w-full max-w-sm xl:max-w-md">
                <SearchForm
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  onSubmit={handleSearchSubmit}
                  t={t}
                />
              </div>

              <nav className="flex items-center gap-6 text-sm font-medium text-[#3f3f3f] xl:gap-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="whitespace-nowrap transition-colors hover:text-black"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d7d7] bg-white text-[#111111] transition-colors hover:border-black"
                aria-label={t("cart")}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[0.68rem] text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            ref={mobileMenuRef}
            className={`absolute inset-y-0 ${
              isRTL ? "right-0" : "left-0"
            } flex h-full w-[88vw] max-w-[340px] flex-col bg-white px-4 pb-5 pt-4 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.35)] sm:px-5`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d7d7] bg-white text-[#111111] transition-colors hover:border-black"
                aria-label={t("closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-5">
              <SearchForm
                query={searchQuery}
                setQuery={setSearchQuery}
                onSubmit={handleSearchSubmit}
                t={t}
                isCompact
              />

              <div className="mt-5 space-y-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-2xl border border-[#e1e1e1] bg-white px-4 py-3 text-base font-medium text-[#111111] transition-colors hover:bg-[#f4f4f4]"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-4 border-t border-[#e6e6e6] pt-5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCartOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white"
              >
                <span>{t("viewCart")}</span>
                <span>{cartItemCount}</span>
              </button>

              <div className="rounded-2xl border border-[#e1e1e1] bg-[#f7f7f7] p-4 text-sm text-[#4d4d4d]">
                <p className="font-semibold text-[#111111]">{t("contact")}</p>
                <a
                  href="tel:+21654407135"
                  className="mt-3 block transition-colors hover:text-black"
                >
                  {t("phone")}: +216 54 407 135
                </a>
                <a
                  href="mailto:mhclothes11@gmail.com"
                  className="mt-2 block break-all transition-colors hover:text-black"
                >
                  {t("email")}: mhclothes11@gmail.com
                </a>
              </div>

              <LanguageToggle
                align={isRTL ? "right" : "left"}
                direction="up"
                wrapperClassName="w-full"
                buttonClassName="w-full justify-between rounded-2xl px-4 py-3 shadow-none"
                menuClassName="w-full min-w-0"
              />
            </div>
          </div>
        </div>
      )}

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
