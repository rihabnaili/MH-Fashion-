'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useLanguage } from '@/app/context/LanguageContext';
import { useProducts } from '@/app/hooks/useProducts';
import ProductCard from '@/app/components/ui/ProductCard';
import ProductGridSkeleton from '@/app/components/ui/ProductGridSkeleton';
import { Loader2, AlertCircle } from 'lucide-react';

function AllProductsContent() {
  const t = useTranslations();
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get search query from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Fetch all products
  const { products, isLoading, error, pagination, fetchProducts } = useProducts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery || undefined,
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      fetchProducts(pagination.currentPage + 1);
    }
  };

  const categories = [
    { value: 'all', label: t("allCategories") },
    { value: 'ensembles', label: t("ensembles") },
    { value: 'tShirtsPolos', label: t("tShirtsPolos") },
    { value: 'shortsPantalons', label: t("shortsPantalons") },
    { value: 'chemises', label: t("chemises") },
    { value: 'packsOffresSpeciales', label: t("packsOffresSpeciales") },
    { value: 'promos', label: t("promos") },
    { value: 'nouveautes', label: t("nouveautes") }
  ];

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-offwhite pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-64 animate-pulse rounded bg-[#efe2d4]" />
            <div className="mt-4 h-5 w-48 animate-pulse rounded bg-[#efe2d4]" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-[#efe2d4]" />
                  <div className="h-11 w-full animate-pulse rounded-lg bg-[#f5ede4]" />
                </div>
              ))}
            </div>
          </div>

          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-offwhite pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-3 text-red-600">{t("errorLoading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4 font-montserrat">
            {t("tousNosProduits")}
          </h1>
          <p className="text-gray-600">
            {products.length} {products.length > 1 ? t("productsFound") : t("productFound")}
            {searchQuery && ` ${t("for")} "${searchQuery}"`}
            {selectedCategory !== 'all' && ` ${t("in")} ${categories.find(c => c.value === selectedCategory)?.label}`}
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("search")}
              </label>
              <input
                type="text"
                placeholder={t("productName")}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("category")}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("sortBy")}
              </label>
              <div className={`relative ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${lang === 'ar' ? 'text-right pr-8' : 'text-left pl-8'}`}
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
                  className="px-8 py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md"
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
              {searchQuery || selectedCategory !== 'all' 
                ? t("tryModifyingSearch")
                : t("noProductsAvailable")
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-offwhite pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-64 animate-pulse rounded bg-[#efe2d4]" />
            <div className="mt-4 h-5 w-48 animate-pulse rounded bg-[#efe2d4]" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-[#efe2d4]" />
                  <div className="h-11 w-full animate-pulse rounded-lg bg-[#f5ede4]" />
                </div>
              ))}
            </div>
          </div>

          <ProductGridSkeleton count={8} />
        </div>
      </div>
    }>
      <AllProductsContent />
    </Suspense>
  );
}
