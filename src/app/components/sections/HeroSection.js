"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import Image from "next/image";

const heroContent = {
  fr: {
    eyebrow: "Edition MH",
    title: "Un vestiaire plus net, plus calme, plus moderne.",
    description:
      "Des pieces faciles a porter, des coupes propres et une selection pensee pour le quotidien comme pour les sorties.",
    sideWords: ["Nouveautes", "Elegance", "Confort"],
  },
  ar: {
    eyebrow: "مختارات MH",
    title: "اسلوب يومي انيق بلمسة اخف وارقى.",
    description:
      "قطع سهلة للبس اليومي مع قصات مرتبة وصور اقرب لروح المتجر الذي يريده العميل.",
    sideWords: ["جديد", "اناقة", "راحة"],
  },
};

const quickLinks = [
  { key: "ensembles", href: "/ensembles" },
  { key: "tShirtsPolos", href: "/t-shirts-polos" },
  { key: "shortsPantalons", href: "/shorts-pantalons" },
  { key: "chemises", href: "/chemises" },
];

export default function HeroSection() {
  const t = useTranslations();
  const { lang, isRTL } = useLanguage();
  const content = heroContent[lang] || heroContent.fr;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-[#efe2d4] pt-20">
      <div className="relative min-h-[430px] sm:min-h-[500px] lg:min-h-0 lg:aspect-[1920/559]">
        <Image
          src="/home-media/main_page.png"
          alt="MH Fashion Hero"
          fill
          className="bg-[#efe2d4] object-cover object-center lg:object-contain"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8efe6]/95 via-[#f8efe6]/62 to-[#8f6a50]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8efe6]/25 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[430px] max-w-7xl items-center px-4 sm:min-h-[500px] sm:px-6 lg:h-full lg:min-h-0 lg:px-8">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div className={`max-w-2xl ${isRTL ? "lg:mr-auto text-right" : "text-left"}`}>
              <p className="mb-5 text-xs uppercase tracking-[0.44em] text-[#9c7356]">
                {content.eyebrow}
              </p>
              <p className="font-script text-4xl tracking-[0.2em] text-[#20130b] sm:text-5xl">
                MH Fashion
              </p>
              <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight text-[#24160d] sm:text-5xl lg:text-6xl">
                {content.title}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#61483a] sm:text-base">
                {content.description}
              </p>

              <div
                className={`mt-8 flex flex-wrap gap-3 ${
                  isRTL ? "justify-end" : "justify-start"
                }`}
              >
                <Link
                  href="/tous-nos-produits"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8f6649] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#77533a]"
                >
                  {t("tousNosProduits")}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/nouveautes"
                  className="inline-flex items-center rounded-full border border-[#d9c6b6] bg-white/80 px-6 py-3 text-sm font-semibold text-[#382317] transition-colors hover:border-[#bc916f] hover:bg-white"
                >
                  {t("newArrivals")}
                </Link>
              </div>
            </div>

            <div className={`hidden lg:flex lg:flex-col lg:gap-4 ${isRTL ? "lg:items-start" : "lg:items-end"}`}>
              {content.sideWords.map((word) => (
                <span
                  key={word}
                  className={`text-white/90 drop-shadow-[0_15px_35px_rgba(36,22,13,0.2)] ${
                    lang === "ar"
                      ? "font-arabic text-4xl font-medium"
                      : "font-script text-5xl"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-[#ead7c7] bg-[#fffbf7]/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
          {quickLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-xs uppercase tracking-[0.34em] text-[#62493b] transition-colors hover:text-[#9c7356] sm:text-sm"
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
