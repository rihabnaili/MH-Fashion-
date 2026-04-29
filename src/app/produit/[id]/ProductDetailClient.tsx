'use client';

import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import CheckoutForm from '@/app/produit/[id]/CheckoutForm';
import ProductImageGallery from '@/app/components/ui/ProductImageGallery';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { PRODUCT_SIZES } from '@/lib/productOptions';
import type { StorefrontProduct } from '@/lib/storefrontProducts';

interface ProductDetailClientProps {
  product: StorefrontProduct;
}

const DELIVERY_FEE = 8;

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { lang } = useLanguage();
  const t = useTranslations();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectionError, setSelectionError] = useState('');

  const productName = product.name[lang as keyof typeof product.name] || product.name.fr;
  const productDescription =
    product.description?.[lang as keyof typeof product.description] || product.description?.fr;
  const requiresSize = product.size.length > 0;
  const requiresColor = product.color.length > 0;
  const availableSizes = new Set(product.size);
  const disabledColors = new Set(product.disabledColors || []);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((previousQuantity) => {
      const nextQuantity = increment ? previousQuantity + 1 : previousQuantity - 1;
      return Math.max(1, nextQuantity);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="w-full lg:w-1/2">
            <ProductImageGallery
              images={product.images || ['/home-media/set.jpg']}
              productName={productName}
              className="w-full"
            />
          </div>

          <div className="w-full space-y-6 lg:w-1/2">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{productName}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-900">
                  TND{product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-red-500 line-through">
                    TND{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                +{DELIVERY_FEE} {t('dt')} {t('deliveryFees')}
              </p>
            </div>

            {requiresSize && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{t('size')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRODUCT_SIZES.map((size) => {
                    const isAvailable = availableSizes.has(size);
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(size);
                          }
                        }}
                        disabled={!isAvailable}
                        aria-disabled={!isAvailable}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : isAvailable
                              ? 'border-gray-300 text-[#111111] hover:border-black'
                              : 'cursor-not-allowed border-[#e5e5e5] bg-[#f3f3f3] text-[#a5a5a5]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {requiresColor && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{t('color')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {product.color.map((color) => {
                    const isDisabled = disabledColors.has(color);
                    const isSelected = selectedColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedColor(color);
                          }
                        }}
                        disabled={isDisabled}
                        aria-disabled={isDisabled}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : isDisabled
                              ? 'cursor-not-allowed border-[#e5e5e5] bg-[#f3f3f3] text-[#a5a5a5]'
                              : 'border-gray-300 text-[#111111] hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{t('quantity')}</label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(false)}
                  className="rounded-lg border border-gray-300 p-2 text-[#111111] transition-colors hover:border-black"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(true)}
                  className="rounded-lg border border-gray-300 p-2 text-[#111111] transition-colors hover:border-black"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {selectionError && (
              <div className="rounded-2xl border border-[#e3c5c5] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2a2a]">
                {selectionError}
              </div>
            )}

            {/* Redirect to checkout form when selections are valid */}
            <CheckoutForm
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              onSuccess={() => {
                // Reset selections after successful order
                setSelectedSize('');
                setSelectedColor('');
                setQuantity(1);
                setSelectionError('');
              }}
            />

            {productDescription && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  {t('productDescription')}
                </h3>
                <div className="prose prose-sm text-gray-700">{productDescription}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
