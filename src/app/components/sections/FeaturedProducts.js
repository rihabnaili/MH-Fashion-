"use client";

import React from "react";
import ProductCard from "../ui/ProductCard";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useProducts } from "@/app/hooks/useProducts";
import { Loader2, AlertCircle } from "lucide-react";

export default function FeaturedProducts() {
  const t = useTranslations();
  
  // Fetch featured products (newest, highest rated, with images)
  const { products, isLoading, error } = useProducts({
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
            {t("featuredProducts")}
          </h2>
          
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <span className="ml-3 text-gray-600">{t("loadingProducts")}</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
            {t("featuredProducts")}
          </h2>
          
          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-3 text-red-600">{t("errorLoading")}</span>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
            {t("featuredProducts")}
          </h2>
          
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌟</div>
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
        <h2 className="text-3xl font-bold font-montserrat text-center mb-12 text-black">
          Tous les produits
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} className="w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
