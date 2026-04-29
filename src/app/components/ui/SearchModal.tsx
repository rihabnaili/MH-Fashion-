"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { useLanguage } from "@/app/context/LanguageContext";
import { useProducts } from "@/app/hooks/useProducts";
import { useTranslations } from "@/app/hooks/useTranslations";
import { buildProductImageUrl } from "@/lib/imageUrl";
import { buildProductPath } from "@/lib/productRoutes";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const { lang } = useLanguage();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(isOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const { products, isLoading } = useProducts({
    search: debouncedQuery || undefined,
    limit: 12,
    autoFetch: debouncedQuery.length > 0,
  });

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 100);
      return () => window.clearTimeout(focusTimer);
    }

    const closeTimer = window.setTimeout(() => {
      setVisible(false);
      setSearchQuery("");
      setDebouncedQuery("");
    }, 300);

    return () => window.clearTimeout(closeTimer);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center bg-black/50 transition-opacity duration-300 sm:items-center ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative h-full w-full overflow-y-auto bg-[#f6f6f6] shadow-lg transition-transform duration-300 sm:mt-20 sm:h-auto sm:max-h-[85vh] sm:w-[90%] sm:max-w-4xl sm:rounded-lg ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 text-black shadow-md transition-colors hover:text-gray-600 sm:right-3 sm:top-3"
          aria-label={t("close")}
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="px-3 pb-4 pt-4 sm:px-4 sm:pb-6 sm:pt-6 lg:px-6">
          <h2 className="mb-3 text-center text-base font-semibold text-black sm:mb-4 sm:text-lg lg:text-xl">
            {t("searchProduct")}
          </h2>

          <div className="mb-4 flex items-center overflow-hidden rounded-md border border-gray-300 shadow-sm focus-within:border-black">
            <Search className="m-2 h-4 w-4 flex-shrink-0 text-gray-500 sm:m-3 sm:h-5 sm:w-5" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full border-0 bg-[#f6f6f6] px-2 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 sm:px-3 sm:py-2.5 sm:text-base"
            />
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500 sm:mr-3 sm:h-5 sm:w-5" />
            )}
          </div>

          {debouncedQuery.length === 0 ? (
            <div className="py-8 text-center text-gray-500 sm:py-12">
              <Search className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:mb-4 sm:h-12 sm:w-12" />
              <p className="text-xs sm:text-sm">{t("searchPlaceholder")}</p>
            </div>
          ) : isLoading && products.length === 0 ? (
            <div className="py-8 text-center sm:py-12">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-black sm:h-8 sm:w-8" />
              <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
                {t("loadingProducts")}
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">
                {products.length}{" "}
                {products.length > 1 ? t("productsFound") : t("productFound")} {t("for")}{" "}
                <span>&quot;{debouncedQuery}&quot;</span>
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                {products.map((product) => {
                  const productName =
                    product.name?.[lang as "fr" | "ar"] || product.name?.fr || t("productName");
                  const actionLabel = lang === "ar" ? "شراء" : "Acheter";

                  return (
                    <div key={product._id} className="w-full">
                      <div className="relative overflow-hidden rounded-lg border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="relative">
                          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-100">
                            <Image
                              src={buildProductImageUrl(product.images?.[0], { variant: "thumb" })}
                              alt={productName}
                              fill
                              className="object-contain bg-gray-100"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              unoptimized
                            />
                          </div>
                          <div className="h-0.5 w-full bg-black" />
                        </div>

                        <div className="p-1.5 text-center sm:p-2">
                          <h3 className="mb-1 min-h-[2rem] line-clamp-2 text-xs font-medium text-black sm:text-sm">
                            {productName}
                          </h3>
                          <div className="mb-1.5 flex flex-wrap items-center justify-center space-x-1 sm:mb-2">
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] text-red-500 line-through sm:text-xs">
                                {product.originalPrice.toFixed(1)} {t("dt")}
                              </span>
                            )}
                            <span className="text-xs font-bold text-black sm:text-sm">
                              {product.price.toFixed(1)} {t("dt")}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              router.push(buildProductPath(product));
                              onClose();
                            }}
                            className="w-full rounded bg-black py-1 text-[10px] font-medium text-white transition-colors hover:bg-gray-800 sm:py-1.5 sm:text-xs"
                          >
                            {actionLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {products.length >= 12 && (
                <div className="mt-4 text-center sm:mt-6">
                  <Link
                    href={`/tous-nos-produits?search=${encodeURIComponent(debouncedQuery)}`}
                    onClick={onClose}
                    className="inline-block px-2 py-1 text-xs font-medium text-black underline transition-colors hover:text-gray-600 sm:text-sm"
                  >
                    {t("viewAllResults") || "Voir tous les resultats"}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center sm:py-12">
              <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">?</div>
              <p className="mb-2 text-sm text-gray-600 sm:text-base">{t("noProductsFound")}</p>
              <p className="px-4 text-xs text-gray-500 sm:text-sm">
                {t("tryModifyingSearch")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
