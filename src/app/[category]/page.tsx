'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useLanguage } from '@/app/context/LanguageContext';
import { useProducts } from '@/app/hooks/useProducts';
import ProductCard from '@/app/components/ui/ProductCard';
import ProductGridSkeleton from '@/app/components/ui/ProductGridSkeleton';
import { AlertCircle } from 'lucide-react';
import { categorySlugMap } from '@/lib/productRoutes';

export default function CategoryPage() {
  const params = useParams();
  const t = useTranslations();
  const { lang } = useLanguage();
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const categorySlug = params.category as string;
  const categoryValue = categorySlugMap[categorySlug];
  const categoryDisplayName = categoryValue;

  // Fetch products for this category
  const { products, isLoading, error, pagination, fetchProducts } = useProducts({
    category: categoryValue,
    limit: 12,
    sortBy,
    sortOrder,
    autoFetch: true
  });

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      fetchProducts(pagination.currentPage + 1);
    }
  };

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] pt-24 sm:pt-28 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-48 animate-pulse rounded bg-[#e3e3e3]" />
            <div className="mt-4 h-5 w-32 animate-pulse rounded bg-[#e3e3e3]" />
          </div>

          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-10 w-64 animate-pulse rounded bg-[#eeeeee]" />
          </div>

          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] pt-24 sm:pt-28 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-3 text-red-600">{t("errorLoading")}</span>
          </div>
        </div>
      </div>
    );
  }

  // Invalid category
  if (!categoryValue) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] pt-24 sm:pt-28 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-black mb-4">Catégorie non trouvée</h1>
            <p className="text-gray-600">La catégorie demandée n&apos;existe pas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] pt-24 sm:pt-28 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4 font-montserrat">
            {t(categoryDisplayName)}
          </h1>
          <p className="text-gray-600">
            {products.length} {products.length > 1 ? t("productsFound") : t("productFound")}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          {/* Sort options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{t("sortBy")}:</span>
            <div className={`relative ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
                className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${lang === 'ar' ? 'text-right pr-8' : 'text-left pl-8'}`}
                style={lang === 'ar' ? { direction: 'rtl' } : { direction: 'ltr' }}
              >
              <option value="createdAt-desc">{t("newest")}</option>
              <option value="createdAt-asc">{t("oldest")}</option>
              <option value="price-asc">{t("priceAscending")}</option>
              <option value="price-desc">{t("priceDescending")}</option>
              <option value="discount-desc">{t("promotions")}</option>
              </select>
            </div>
          </div>

        </div>

        {/* Products Grid/List */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Load more button */}
            {pagination?.hasNextPage && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="rounded-lg bg-black px-8 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? t("loading") : t("loadMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("noProductsFound")}
            </h3>
            <p className="text-gray-600">
              {t("noProductsInCategory")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
