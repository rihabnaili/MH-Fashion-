"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "../ui/ProductCard";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useProducts } from "@/app/hooks/useProducts";
import { useLanguage } from "@/app/context/LanguageContext";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

const homeCopy = {
  fr: {
    sectionAction: "Explorer la selection",
    catalogEyebrow: "Catalogue MH",
    catalogDescription:
      "Les pieces les plus recentes restent visibles ici, avec un acces direct au catalogue complet quand le client veut parcourir tout le stock.",
    catalogAction: "Voir le catalogue complet",
    summary: (visible, total) => `Affichage de ${visible} sur ${total} produits`,
  },
  ar: {
    sectionAction: "اكتشف القسم",
    catalogEyebrow: "كتالوج MH",
    catalogDescription:
      "هنا تظهر احدث القطع مع زر واضح يقود مباشرة الى الكتالوج الكامل حتى يرى العميل كل المخزون.",
    catalogAction: "عرض كل المنتجات",
    summary: (visible, total) => `عرض ${visible} من اصل ${total} منتج`,
  },
};

const categorySections = [
  {
    key: "ensembles",
    href: "/ensembles",
    eyebrow: { fr: "Silhouettes completes", ar: "تنسيقات كاملة" },
    description: {
      fr: "Des looks deja composes pour acheter plus vite sans perdre le ton premium du magasin.",
      ar: "اطلالات جاهزة ومنسقة تساعد الزائر يلقى اللوك كامل بسرعة.",
    },
  },
  {
    key: "tShirtsPolos",
    href: "/t-shirts-polos",
    eyebrow: { fr: "Essentiels legers", ar: "اساسيات خفيفة" },
    description: {
      fr: "Une selection simple et nette pour le quotidien, avec des pieces faciles a associer.",
      ar: "قمصان وبولو بقصات نظيفة وسهلة للتنسيق اليومي.",
    },
  },
  {
    key: "shortsPantalons",
    href: "/shorts-pantalons",
    eyebrow: { fr: "Bases du dressing", ar: "قطع اساسية" },
    description: {
      fr: "Pantalons et shorts presentes avec plus d'espace pour mieux valoriser les images produit.",
      ar: "شورتات وبناطيل مع عرض اهدأ يبرز الصورة والسعر بشكل اوضح.",
    },
  },
  {
    key: "chemises",
    href: "/chemises",
    eyebrow: { fr: "Editions plus habillees", ar: "اختيارات ارقى" },
    description: {
      fr: "Des chemises pour renforcer la partie habillee du catalogue sans quitter l'identite MH.",
      ar: "قمصان تعطي للمحل طابع ارقى وتحافظ على هوية MH.",
    },
  },
];

function LoadingGrid({ count }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[23rem] animate-pulse rounded-[1.7rem] border border-[#eadacb] bg-white/70"
        />
      ))}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  actionLabel,
  isRTL,
}) {
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className={isRTL ? "md:text-right" : ""}>
        <p className="mb-3 text-xs uppercase tracking-[0.38em] text-[#9c7356]">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold tracking-[0.08em] text-[#24160d] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6a5142] sm:text-base">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-2 self-start rounded-full border border-[#ddc9b8] bg-white/85 px-5 py-3 text-sm font-semibold text-[#372318] transition-colors hover:border-[#bc916f] hover:bg-white"
      >
        {actionLabel}
        <ArrowIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function FeaturedProducts() {
  const t = useTranslations();
  const { lang, isRTL } = useLanguage();
  const copy = homeCopy[lang] || homeCopy.fr;
  const { products, isLoading, error, pagination } = useProducts({
    limit: 40,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const featuredProducts = products.slice(0, 8);

  if (error && !products.length) {
    return (
      <section className="bg-[#fffaf5] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[18rem] items-center justify-center rounded-[2rem] border border-[#eadacb] bg-white/90 px-6 text-center shadow-[0_25px_70px_-45px_rgba(74,46,30,0.45)]">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-8 w-8 text-[#bc5b52]" />
              <span className="text-[#6a5142]">{t("errorLoading")}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <section className="bg-[#fffaf5] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#eadacb] bg-white/90 px-6 py-16 text-center shadow-[0_25px_70px_-45px_rgba(74,46,30,0.45)]">
            <p className="text-xl text-[#6a5142]">{t("noFeaturedProducts")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {categorySections.map((section, index) => {
        const categoryProducts = products
          .filter((product) => product.category === section.key)
          .slice(0, 4);

        if (!isLoading && categoryProducts.length === 0) {
          return null;
        }

        return (
          <section
            key={section.key}
            className={`py-16 sm:py-20 ${
              index % 2 === 0 ? "bg-[#fffaf5]" : "bg-[#f8efe6]"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow={section.eyebrow[lang] || section.eyebrow.fr}
                title={t(section.key)}
                description={section.description[lang] || section.description.fr}
                href={section.href}
                actionLabel={copy.sectionAction}
                isRTL={isRTL}
              />

              {isLoading ? (
                <LoadingGrid count={4} />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section className="bg-[#fffaf5] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={copy.catalogEyebrow}
            title={t("tousNosProduits")}
            description={copy.catalogDescription}
            href="/tous-nos-produits"
            actionLabel={copy.catalogAction}
            isRTL={isRTL}
          />

          {isLoading ? (
            <LoadingGrid count={8} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
                <p className="text-sm text-[#8a6a54]">
                  {copy.summary(
                    featuredProducts.length,
                    pagination?.totalProducts || featuredProducts.length
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
