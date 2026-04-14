"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
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
  const { lang, isRTL } = useLanguage();
  const footerCopy =
    lang === "ar"
      ? {
          title: "اطلب بسهولة وخلي الزيارة ابسط.",
          button: "اتصل بنا",
        }
      : {
          title: "Besoin d'aide pour commander ?",
          button: "Nous appeler",
        };

  return (
    <footer className="border-t border-[#dddddd] bg-[#f3f3f3] py-14 font-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-5 rounded-[2rem] border border-[#d8d8d8] bg-white px-6 py-8 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.18)] md:flex-row md:items-center md:justify-between">
          <div className={isRTL ? "md:text-right" : "md:text-left"}>
            <p className="text-xs uppercase tracking-[0.38em] text-[#8b8b8b]">
              MH Fashion
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#111111] sm:text-3xl">
              {footerCopy.title}
            </h2>
          </div>

          <a
            href="tel:+21654407135"
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
          >
            {footerCopy.button}
          </a>
        </div>

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
