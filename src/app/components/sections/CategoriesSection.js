"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import Image from "next/image";

const categoryImages = {
  ensembles: "/home-media/set.jpg",
  chemises: "/home-media/set.jpg",
  packs: "/home-media/set.jpg",
  tshirtsPolos: "/home-media/set.jpg",
  shortsPantalons: "/home-media/set.jpg",
  pantalons: "/home-media/set.jpg",
};

export default function CategoriesSection() {
  const t = useTranslations();
  const { lang } = useLanguage();
  const scrollRef = useRef(null);

  const categories = [
    { key: "ensembles", imgSrc: categoryImages.ensembles },
    { key: "chemises", imgSrc: categoryImages.chemises },
    { key: "packsOffresSpeciales", imgSrc: categoryImages.packs },
    { key: "tShirtsPolos", imgSrc: categoryImages.tshirtsPolos },
    { key: "shortsPantalons", imgSrc: categoryImages.shortsPantalons },
    { key: "pantalons", imgSrc: categoryImages.pantalons },
  ];

  /**
   * Scrolls the categories carousel in the specified direction
   * @param {string} direction - either 'left' or 'right'
   */
  const scroll = (direction) => {
    if (scrollRef.current instanceof HTMLElement) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-center mb-6 md:mb-8 text-black">
          {t("browseCategories")}
        </h2>

        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-6 gap-6 md:gap-8">
          {categories.map(({ key, imgSrc }, index) => (
            <div key={key} className={`text-center group cursor-pointer font-text text-black ${key === 'ensembles' || key === 'chemises' ? 'ml-5' : ''}`}>
              <div className="relative overflow-hidden rounded-md mb-2">
                <div className="relative w-full pt-[100%]">
                  <Image
                    src={imgSrc}
                    alt={t(key)}
                    fill
                    className="object-cover transform group-hover:scale-105 transition duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 16vw"
                  />
                </div>
              </div>
              <h3 className="font-medium">{t(key)}</h3>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => scroll("left")}
            className={`absolute top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 ${lang === 'ar' ? 'right-0' : 'left-0'}`}
          >
            <ChevronLeft className={`w-5 h-5 text-black ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth px-4"
          >
            {categories.map(({ key, imgSrc }, index) => (
              <div
                key={key}
                className={`min-w-[160px] flex-shrink-0 text-center group cursor-pointer font-text text-black ${key === 'ensembles' || key === 'chemises' ? 'ml-6' : ''}`}
              >
                <div className="relative overflow-hidden rounded-md mb-2">
                  <div className="relative w-full h-36">
                    <Image
                      src={imgSrc}
                      alt={t(key)}
                      fill
                      className="object-cover transform group-hover:scale-110 transition duration-500"
                      sizes="(max-width: 768px) 160px, 160px"
                    />
                  </div>
                </div>
                <h3 className="text-sm font-medium">{t(key)}</h3>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className={`absolute top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 ${lang === 'ar' ? 'left-0' : 'right-0'}`}
          >
            <ChevronRight className={`w-5 h-5 text-black ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  );
}
