'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface ProductsPaginationProps {
  pagination: PaginationData;
  currentCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const getVisiblePages = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const visiblePages: Array<number | 'ellipsis'> = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      visiblePages.push('ellipsis');
    }

    visiblePages.push(page);
  });

  return visiblePages;
};

export default function ProductsPagination({
  pagination,
  currentCount,
  onPageChange,
  isLoading = false,
}: ProductsPaginationProps) {
  const { lang } = useLanguage();
  const t = useTranslations();

  if (!pagination || pagination.totalProducts === 0) {
    return null;
  }

  const startItem = (pagination.currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(startItem + currentCount - 1, pagination.totalProducts);
  const visiblePages = getVisiblePages(pagination.currentPage, pagination.totalPages);

  return (
    <div className="mt-10 space-y-4 pb-10 sm:pb-14">
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${lang === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
        <p className="text-sm text-gray-600">
          {t('showingPageResults', {
            start: startItem,
            end: endItem,
            total: pagination.totalProducts,
          })}
        </p>
        <p className="text-sm font-medium text-gray-700">
          {t('pageOf', {
            current: pagination.currentPage,
            total: pagination.totalPages,
          })}
        </p>
      </div>

      {pagination.totalPages > 1 && (
        <div className={`flex flex-wrap items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-center'}`}>
          <button
            type="button"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t('previousPage')}</span>
          </button>

          {visiblePages.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-sm text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                type="button"
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`min-w-[42px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  pagination.currentPage === page
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{t('nextPage')}</span>
            <ChevronRight className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}
