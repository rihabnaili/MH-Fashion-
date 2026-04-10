"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "../ui/ProductCard";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useProducts } from "@/app/hooks/useProducts";
import { Loader2, AlertCircle } from "lucide-react";

const HOME_PRODUCTS_LIMIT = 8;

export default function FeaturedProducts() {
  const t = useTranslations();

  // Fetch the newest products for the home page preview.
  const { products, isLoading, error, pagination } = useProducts({
    limit: HOME_PRODUCTS_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const totalProducts = pagination?.totalProducts ?? products.length;
  const visibleStart = totalProducts > 0 ? 1 : 0;
  const visibleEnd = totalProducts > 0 ? Math.min(products.length, totalProducts) : 0;

  if (isLoading) {
    return (
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
            {t("newArrivals")}
          </h2>

          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <span className="ml-3 text-gray-600">{t("loadingProducts")}</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
            {t("newArrivals")}
          </h2>

          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-3 text-red-600">{t("errorLoading")}</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
            {t("newArrivals")}
          </h2>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">*</div>
            <p className="text-gray-500 text-xl">
              {t("noFeaturedProducts")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold font-montserrat text-black">
            {t("newArrivals")}
          </h2>
          <p className="mt-4 text-base text-gray-600">
            {t("catalogPreviewDescription", { count: HOME_PRODUCTS_LIMIT })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} className="w-full" />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600">
            {t("showingPageResults", {
              start: visibleStart,
              end: visibleEnd,
              total: totalProducts,
            })}
          </p>
          <Link
            href="/tous-nos-produits"
            className="inline-flex items-center justify-center rounded-lg bg-black px-8 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
          >
            {t("browseFullCatalog")}
          </Link>
        </div>
      </div>
    </section>
  );
}
