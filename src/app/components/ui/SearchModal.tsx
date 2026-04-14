"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import { useProducts } from "@/app/hooks/useProducts";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Image from "next/image";
import { buildProductImageUrl } from "@/lib/imageUrl";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(isOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products with search query
  const { products, isLoading } = useProducts({
    search: debouncedQuery || undefined,
    limit: 12,
    autoFetch: debouncedQuery.length > 0
  });

  // Manage visibility with transition
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const timeout = setTimeout(() => {
        setVisible(false);
        setSearchQuery("");
        setDebouncedQuery("");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-offwhite w-full h-full sm:w-[90%] sm:h-auto sm:max-w-4xl sm:mt-20 sm:max-h-[85vh] overflow-y-auto sm:rounded-lg shadow-lg relative
          transform transition-transform duration-300
          ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 text-black hover:text-gold transition-colors bg-white rounded-full p-1.5 sm:p-1 shadow-md"
          aria-label={t("close")}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* All content in one flow */}
        <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-center mb-3 sm:mb-4 text-black">
            {t("searchProduct")}
          </h2>

          {/* Search input */}
          <div className="flex items-center rounded-md overflow-hidden focus-within:border-black shadow-sm border border-gray-300 mb-4">
            <Search className="m-2 sm:m-3 text-gray-500 w-4 h-4 sm:w-5 sm:h-6 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-0 bg-offwhite px-2 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 animate-spin mr-2 sm:mr-3 flex-shrink-0" />
            )}
          </div>

          {/* Search Results - Directly below search */}
          {debouncedQuery.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-xs sm:text-sm">{t("searchPlaceholder")}</p>
            </div>
          ) : isLoading && products.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-black animate-spin" />
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">{t("loadingProducts")}</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                {products.length} {products.length > 1 ? t("productsFound") : t("productFound")} {t("for")} <span>&quot;{debouncedQuery}&quot;</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {products.map((product) => {
                  const handleBuyClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    addToCart(product, '', '', 1);
                    router.push('/panier');
                    onClose();
                  };

                  const productName = product.name?.[lang as 'fr' | 'ar'] || product.name?.fr || t("productName");

                  return (
                    <div key={product._id} className="w-full">
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative border-2 border-black">
                        <div className="relative">
                          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            <Image
                              src={buildProductImageUrl(product.images?.[0], {
                                variant: 'thumb',
                              })}
                              alt={productName}
                              fill
                              className="object-contain bg-gray-100"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              unoptimized
                            />
                          </div>
                          <div className="w-full h-0.5 bg-black"></div>
                        </div>
                        <div className="p-1.5 sm:p-2 text-center">
                          <h3 className="font-medium text-black mb-1 text-xs sm:text-sm line-clamp-2 min-h-[2rem]">{productName}</h3>
                          <div className="flex items-center justify-center space-x-1 mb-1.5 sm:mb-2 flex-wrap">
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] sm:text-xs text-red-500 line-through">
                                {product.originalPrice.toFixed(1)} {t('dt')}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-bold text-black">
                              {product.price.toFixed(1)} {t('dt')}
                            </span>
                          </div>
                          <button 
                            onClick={handleBuyClick}
                            className="w-full bg-black hover:bg-gray-800 text-white py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors"
                          >
                            {lang === 'ar' ? 'شراء' : 'Acheter'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {products.length >= 12 && (
                <div className="mt-4 sm:mt-6 text-center">
                  <Link
                    href={`/tous-nos-produits?search=${encodeURIComponent(debouncedQuery)}`}
                    onClick={onClose}
                    className="inline-block text-xs sm:text-sm text-black hover:text-gold font-medium underline px-2 py-1"
                  >
                    {t("viewAllResults") || "Voir tous les résultats"}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
              <p className="text-sm sm:text-base text-gray-600 mb-2">{t("noProductsFound")}</p>
              <p className="text-xs sm:text-sm text-gray-500 px-4">
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
