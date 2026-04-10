'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useLanguage } from '@/app/context/LanguageContext';
import { useProducts } from '@/app/hooks/useProducts';
import ProductCard from '@/app/components/ui/ProductCard';
import ProductsPagination from '@/app/components/ui/ProductsPagination';
import { Loader2, AlertCircle } from 'lucide-react';

// Map category slugs to actual category values
const categorySlugMap: Record<string, string> = {
  'ensembles': 'ensembles',
  't-shirts-polos': 'tShirtsPolos',
  'shorts-pantalons': 'shortsPantalons',
  'chemises': 'chemises',
  'packs-offres-speciales': 'packsOffresSpeciales',
  'promos': 'promos',
  'nouveautes': 'nouveautes'
};

// Reverse mapping for display names
const categoryDisplayMap: Record<string, string> = {
  'ensembles': 'ensembles',
  't-shirts-polos': 'tShirtsPolos',
  'shorts-pantalons': 'shortsPantalons',
  'chemises': 'chemises',
  'packs-offres-speciales': 'packsOffresSpeciales',
  'promos': 'promos',
  'nouveautes': 'nouveautes'
};

const PRODUCTS_PER_PAGE = 8;

export default function CategoryPage() {
  const params = useParams();
  const t = useTranslations();
  const { lang } = useLanguage();
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const categorySlug = params.category as string;
  const categoryValue = categorySlugMap[categorySlug];
  const categoryDisplayName = categoryDisplayMap[categorySlug];

  // Fetch products for this category
  const { products, isLoading, error, pagination, goToPage } = useProducts({
    category: categoryValue,
    limit: PRODUCTS_PER_PAGE,
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

  const totalProducts = pagination?.totalProducts ?? products.length;
  const currentPage = pagination?.currentPage ?? 1;
  const currentLimit = pagination?.limit ?? PRODUCTS_PER_PAGE;
  const visibleStart = totalProducts === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const visibleEnd = totalProducts === 0 ? 0 : Math.min(visibleStart + products.length - 1, totalProducts);

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-offwhite pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <span className="ml-3 text-gray-600">{t("loadingProducts")}</span>
          </div>
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

  // Invalid category
  if (!categoryValue) {
    return (
      <div className="min-h-screen bg-offwhite pt-32">
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
    <div className="min-h-screen bg-offwhite pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4 font-montserrat">
            {t(categoryDisplayName)}
          </h1>
          <p className="text-gray-600">
            {totalProducts} {totalProducts > 1 ? t("productsFound") : t("productFound")}
          </p>
          {totalProducts > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              {t('showingPageResults', {
                start: visibleStart,
                end: visibleEnd,
                total: totalProducts,
              })}
            </p>
          )}
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

            {pagination && (
              <ProductsPagination
                pagination={pagination}
                currentCount={products.length}
                onPageChange={goToPage}
                isLoading={isLoading}
              />
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
