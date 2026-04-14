"use client";

import Link from "next/link";
import { Mail, Phone, ShoppingBag } from "lucide-react";

import { useLanguage } from "@/app/context/LanguageContext";
import { useTranslations } from "@/app/hooks/useTranslations";

export default function ContactPage() {
  const t = useTranslations();
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f6f6f6] pt-24 sm:pt-28 lg:pt-32">
      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <section className="rounded-[2rem] border border-[#dddddd] bg-white px-5 py-8 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.15)] sm:px-8 sm:py-10">
          <div className={`max-w-3xl ${isRTL ? "ml-auto text-right" : "text-left"}`}>
            <p className="text-xs uppercase tracking-[0.34em] text-[#7a7a7a]">
              MH Fashion
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[#111111] sm:text-4xl">
              {t("contactPageTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5c5c5c] sm:text-base">
              {t("contactPageDescription")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.6rem] border border-[#e3e3e3] bg-[#fafafa] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {t("contactPageCallLabel")}
                  </p>
                  <a
                    href="tel:+21654407135"
                    className="mt-1 block text-sm text-[#5c5c5c] transition-colors hover:text-black"
                  >
                    +216 54 407 135
                  </a>
                </div>
              </div>

              <a
                href="tel:+21654407135"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
              >
                {t("contactPageCallCta")}
              </a>
            </div>

            <div className="rounded-[1.6rem] border border-[#e3e3e3] bg-[#fafafa] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {t("contactPageEmailLabel")}
                  </p>
                  <a
                    href="mailto:mhclothes11@gmail.com"
                    className="mt-1 block break-all text-sm text-[#5c5c5c] transition-colors hover:text-black"
                  >
                    mhclothes11@gmail.com
                  </a>
                </div>
              </div>

              <a
                href="mailto:mhclothes11@gmail.com"
                className="mt-5 inline-flex items-center justify-center rounded-full border border-[#d4d4d4] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-black hover:bg-[#f2f2f2]"
              >
                {t("contactPageMailCta")}
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.6rem] border border-[#e3e3e3] bg-white p-5 sm:p-6">
              <p className="text-sm font-semibold text-[#111111]">
                {t("contactPageHoursLabel")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5c5c5c]">
                {t("contactPageHoursValue")}
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-[#e3e3e3] bg-white p-5 sm:p-6">
              <p className="text-sm font-semibold text-[#111111]">
                {t("contactPageResponseLabel")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5c5c5c]">
                {t("contactPageResponseValue")}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className={isRTL ? "sm:text-right" : "sm:text-left"}>
              <p className="text-sm font-semibold text-[#111111]">
                {t("contactPageCatalogCta")}
              </p>
              <p className="mt-1 text-sm text-[#6a6a6a]">
                {t("customerSupport")}: 7j/7
              </p>
            </div>

            <Link
              href="/tous-nos-produits"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("tousNosProduits")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
