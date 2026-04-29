import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/app/context/LanguageContext";
import { useTranslations } from "@/app/hooks/useTranslations";
import { buildProductImageUrl } from "@/lib/imageUrl";
import { buildProductPath } from "@/lib/productRoutes";

const ProductCard = ({ product, className = "" }) => {
  const t = useTranslations();
  const { lang } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const productName = product.name?.[lang] || product.name?.fr || t("productName");
  const productImage = buildProductImageUrl(product.images?.[0], {
    variant: "thumb",
  });
  const actionLabel = lang === "ar" ? "شراء" : "Acheter";

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-[#dddddd] bg-white shadow-[0_25px_60px_-42px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-36px_rgba(0,0,0,0.22)] ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f3f3]">
        {discountPercentage > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#9d3a36] shadow-sm">
            -{discountPercentage}%
          </span>
        )}

        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-[#ededed] px-6 text-center text-sm text-[#707070]">
            Image non disponible
          </div>
        ) : (
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            unoptimized
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-5 pt-4 text-center">
        <h3 className="min-h-[2.7rem] text-sm font-semibold uppercase tracking-[0.08em] text-[#111111] sm:text-[0.95rem]">
          {productName}
        </h3>

        <div className="mt-3 flex items-center justify-center gap-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#a45f58] line-through">
              {product.originalPrice.toFixed(1)} {t("dt")}
            </span>
          )}
          <span className="text-base font-semibold text-[#111111]">
            {product.price.toFixed(1)} {t("dt")}
          </span>
        </div>

        <Link
          href={buildProductPath(product)}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
