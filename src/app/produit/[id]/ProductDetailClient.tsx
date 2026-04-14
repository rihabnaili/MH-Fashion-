'use client';

import React, { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

import ProductImageGallery from '@/app/components/ui/ProductImageGallery';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import type { StorefrontProduct } from '@/lib/storefrontProducts';

interface ProductDetailClientProps {
  product: StorefrontProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const t = useTranslations();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productName = product.name[lang as keyof typeof product.name] || product.name.fr;
  const productDescription =
    product.description?.[lang as keyof typeof product.description] || product.description?.fr;

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((previousQuantity) => {
      const nextQuantity = increment ? previousQuantity + 1 : previousQuantity - 1;
      return Math.max(1, nextQuantity);
    });
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      return;
    }

    setIsAddingToCart(true);
    try {
      addToCart(product, selectedSize, selectedColor, quantity);
      alert(t('addedToCart'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(t('errorAddingToCart'));
    } finally {
      setIsAddingToCart(false);
    }
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
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{t('size')}</label>
              <div className="grid grid-cols-4 gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-[#111111] hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{t('color')}</label>
              <div className="grid grid-cols-4 gap-2">
                {product.color.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-[#111111] hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

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

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || isAddingToCart}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-black py-4 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingToCart ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>{t('addToCart')}</span>
                </>
              )}
            </button>

            {productDescription && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900">{t('description')}</h3>
                <div className="prose prose-sm text-gray-700">{productDescription}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
