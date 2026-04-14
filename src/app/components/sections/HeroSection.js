"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { useTranslations } from "@/app/hooks/useTranslations";

const quickLinks = [
  { key: "ensembles", href: "/ensembles" },
  { key: "tShirtsPolos", href: "/t-shirts-polos" },
  { key: "shortsPantalons", href: "/shorts-pantalons" },
  { key: "chemises", href: "/chemises" },
];

export default function HeroSection() {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden bg-black pt-16 sm:pt-20">
      <div className="relative min-h-[320px] bg-black sm:min-h-[420px] lg:aspect-[1920/559] lg:min-h-0">
        <Image
          src="/home-media/main_page.png"
          alt="MH Fashion Hero"
          fill
          priority
          sizes="100vw"
          className="bg-black object-contain object-center"
        />
      </div>

      <div className="border-y border-[#232323] bg-black">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
          {quickLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-xs uppercase tracking-[0.34em] text-[#bdbdbd] transition-colors hover:text-white sm:text-sm"
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
