'use client';

import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

import ProductImageGallery from '@/app/components/ui/ProductImageGallery';
import { useCart } from '@/app/context/CartContext';
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
  const { addToCart, openCart } = useCart();
  const t = useTranslations();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectionError, setSelectionError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const productName = product.name[lang as keyof typeof product.name] || product.name.fr;
  const productDescription =
    product.description?.[lang as keyof typeof product.description] || product.description?.fr;
  const requiresSize = product.size.length > 0;
  const requiresColor = product.color.length > 0;
  const availableSizes = new Set(product.size);
  const variantHint =
    lang === 'ar'
      ? 'يمكنك إضافة نفس المنتج بمقاسات أو ألوان مختلفة ثم إنهاء الطلب من السلة الجانبية.'
      : 'Vous pouvez ajouter le meme produit en plusieurs tailles ou couleurs puis finaliser depuis le panier lateral.';
  const openCartLabel = lang === 'ar' ? 'فتح السلة' : 'Ouvrir le panier';

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((previousQuantity) => {
      const nextQuantity = increment ? previousQuantity + 1 : previousQuantity - 1;
      return Math.max(1, nextQuantity);
    });
  };

  const handleAddToCart = () => {
    setSelectionError('');
    setConfirmationMessage('');

    if ((requiresSize && !selectedSize) || (requiresColor && !selectedColor)) {
      setSelectionError(t('pleaseSelectSizeAndColor'));
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);

    const confirmation =
      lang === 'ar'
        ? 'تمت إضافة هذا الخيار إلى السلة. يمكنك الآن تغيير اللون أو المقاس وإضافة خيار آخر قبل فتح السلة.'
        : 'Cette variante a ete ajoutee au panier. Vous pouvez maintenant changer la taille ou la couleur et ajouter une autre variante avant d ouvrir le panier.';
    setConfirmationMessage(confirmation);
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

            <div className="space-y-4 rounded-[1.75rem] border border-[#e6e6e6] bg-[#fafafa] p-4 sm:p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[#111111]">{t('cart')}</h2>
                <p className="text-sm text-[#666666]">{variantHint}</p>
              </div>

              <div className="rounded-2xl border border-[#e3e3e3] bg-white px-4 py-3">
                <div className="flex items-center justify-between text-sm text-[#666666]">
                  <span>{t('price')}</span>
                  <span>
                    {(product.price * quantity).toFixed(2)} {t('dt')}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#666666]">
                  <span>{t('deliveryFees')}</span>
                  <span>
                    +{DELIVERY_FEE.toFixed(2)} {t('dt')}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#dfdfdf] pt-3 text-base font-semibold text-[#111111]">
                  <span>{t('total')}</span>
                  <span>
                    {(product.price * quantity + DELIVERY_FEE).toFixed(2)} {t('dt')}
                  </span>
                </div>
              </div>

              {selectionError && (
                <div className="rounded-2xl border border-[#e3c5c5] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2a2a]">
                  {selectionError}
                </div>
              )}

              {confirmationMessage && (
                <div className="rounded-2xl border border-[#d7e5d1] bg-[#f5fbf2] px-4 py-3 text-sm text-[#34572b]">
                  {confirmationMessage}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t('addToCart')}</span>
                </button>

                <button
                  type="button"
                  onClick={openCart}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d7d7d7] bg-white py-4 text-sm font-semibold text-[#111111] transition-colors hover:border-black"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{openCartLabel}</span>
                </button>
              </div>
            </div>

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
