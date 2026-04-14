"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "@/app/hooks/useTranslations";
import Logo from "../ui/Logo";

const usefulLinks = [
  { key: "tousNosProduits", href: "/tous-nos-produits" },
  { key: "nouveautes", href: "/nouveautes" },
  { key: "promos", href: "/promos" },
];

const categoryLinks = [
  { key: "ensembles", href: "/ensembles" },
  { key: "tShirtsPolos", href: "/t-shirts-polos" },
  { key: "shortsPantalons", href: "/shorts-pantalons" },
  { key: "chemises", href: "/chemises" },
];

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-[#dddddd] bg-[#f3f3f3] py-14 font-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#5c5c5c]">
              {t("footerDescription")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-title text-lg text-[#111111]">
              {t("usefulLinks")}
            </h3>
            <ul className="space-y-3 text-sm text-[#5c5c5c]">
              {usefulLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-black"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-title text-lg text-[#111111]">
              {t("categories")}
            </h3>
            <ul className="space-y-3 text-sm text-[#5c5c5c]">
              {categoryLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-black"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div id="contact" className="scroll-mt-24">
            <h3 className="mb-4 font-title text-lg text-[#111111]">
              {t("contact")}
            </h3>
            <ul className="space-y-3 text-sm text-[#5c5c5c]">
              <li>{t("email")}: mhclothes11@gmail.com</li>
              <li>{t("phone")}: +216 54 407 135</li>
              <li>{t("customerService")}: 7j/7</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#d9d9d9] pt-6 text-center text-sm text-[#727272]">
          <p>2025 MH Fashion. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
