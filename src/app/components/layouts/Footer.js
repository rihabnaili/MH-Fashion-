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
          title: "Un footer plus clair pour finir la visite proprement.",
          button: "Nous appeler",
        };

  return (
    <footer className="border-t border-[#e5d4c5] bg-[#f8efe6] py-14 font-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-5 rounded-[2rem] border border-[#e5d4c5] bg-white/80 px-6 py-8 shadow-[0_25px_60px_-45px_rgba(74,46,30,0.55)] md:flex-row md:items-center md:justify-between">
          <div className={isRTL ? "md:text-right" : "md:text-left"}>
            <p className="text-xs uppercase tracking-[0.38em] text-[#9c7356]">
              MH Fashion
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#24160d] sm:text-3xl">
              {footerCopy.title}
            </h2>
          </div>

          <a
            href="tel:+21654407135"
            className="inline-flex items-center justify-center rounded-full bg-[#8f6649] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#77533a]"
          >
            {footerCopy.button}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#6f5646]">
              {t("footerDescription")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-title text-lg text-[#24160d]">
              {t("usefulLinks")}
            </h3>
            <ul className="space-y-3 text-sm text-[#6f5646]">
              {usefulLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[#9c7356]"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-title text-lg text-[#24160d]">
              {t("categories")}
            </h3>
            <ul className="space-y-3 text-sm text-[#6f5646]">
              {categoryLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[#9c7356]"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-title text-lg text-[#24160d]">
              {t("contact")}
            </h3>
            <ul className="space-y-3 text-sm text-[#6f5646]">
              <li>{t("email")}: mhclothes11@gmail.com</li>
              <li>{t("phone")}: +216 54 407 135</li>
              <li>{t("customerService")}: 7j/7</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#e0cfbf] pt-6 text-center text-sm text-[#7e6554]">
          <p>2025 MH Fashion. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
