"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "@/app/hooks/useTranslations";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-black text-offwhite py-12 font-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="/logo2.png"
                alt="MH Fashion Logo"
                width={80}
                height={80}
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t("footerDescription") }
            </p>
          </div>

          <div>
            <h3 className="font-title font-medium mb-4">{t("usefulLinks")}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-gold">
                  {t("promos")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold">
                  {t("newArrivals")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold">
                  {t("allProducts")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold">
                  {t("ourBrands")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-title font-medium mb-4">{t("categories")}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-gold">
                  {t("ensembles")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold">
                  {t("chemises")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold">
                  {t("tShirtsPolos")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold">
                  {t("shortsPantalons")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-title font-medium mb-4">{t("contact")}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>{t("email")}: mhclothes11@gmail.com</li>
              <li>{t("phone")}: +216 54 407 135</li>
              <li>{t("customerService")}: 7j/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 MH Fashion. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
