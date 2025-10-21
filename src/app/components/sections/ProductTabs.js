"use client";

import React, { useState } from "react";
import ProductCard from "../ui/ProductCard";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useProducts } from "@/app/hooks/useProducts";
import { Loader2, AlertCircle } from "lucide-react";

export default function ProductTabs() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("nouveautes");

  const tabs = [
    { key: "nouveautes", label: "nouveautes", sortBy: "createdAt", sortOrder: "desc" },
    { key: "topVentes", label: "topVentes", sortBy: "createdAt", sortOrder: "desc" },
    { key: "promos", label: "promos", sortBy: "discount", sortOrder: "desc" },
  ];

  // Get products for each tab
  const nouveautes = useProducts({ 
    limit: 8, 
    sortBy: "createdAt", 
    sortOrder: "desc",
    autoFetch: activeTab === "nouveautes"
  });

  const topVentes = useProducts({ 
    limit: 8, 
    sortBy: "createdAt", 
    sortOrder: "desc",
    autoFetch: activeTab === "topVentes"
  });

  const promos = useProducts({ 
    limit: 8, 
    sortBy: "discount", 
    sortOrder: "desc",
    autoFetch: activeTab === "promos"
  });

  // Get the active tab data
  const getActiveTabData = () => {
    switch (activeTab) {
      case "nouveautes":
        return nouveautes;
      case "topVentes":
        return topVentes;
      case "promos":
        return promos;
      default:
        return nouveautes;
    }
  };

  const activeData = getActiveTabData();

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  // Loading state
  if (activeData.isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="flex space-x-8 border-b">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`pb-4 px-2 font-medium font-text text-sm transition-colors ${
                    activeTab === key
                      ? "text-gold border-b-2 border-gold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <span className="ml-3 text-gray-600">{t("loadingProducts")}</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (activeData.error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="flex space-x-8 border-b">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`pb-4 px-2 font-medium font-text text-sm transition-colors ${
                    activeTab === key
                      ? "text-gold border-b-2 border-gold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-3 text-red-600">{t("errorLoading")}</span>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (activeData.products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="flex space-x-8 border-b">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`pb-4 px-2 font-medium font-text text-sm transition-colors ${
                    activeTab === key
                      ? "text-gold border-b-2 border-gold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-xl">
              {t("noProductsAvailable")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="flex space-x-8 border-b">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`pb-4 px-2 font-medium font-text text-sm transition-colors ${
                  activeTab === key
                    ? "text-gold border-b-2 border-gold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t(label)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeData.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
