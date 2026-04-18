'use client';

import React, { useState } from 'react';
import { CheckCircle2, MapPin, Minus, Phone, Plus, User } from 'lucide-react';

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
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const productName = product.name[lang as keyof typeof product.name] || product.name.fr;
  const productDescription =
    product.description?.[lang as keyof typeof product.description] || product.description?.fr;
  const requiresSize = product.size.length > 0;
  const requiresColor = product.color.length > 0;
  const availableSizes = new Set(product.size);
  const disabledColors = new Set(product.disabledColors || []);
  const subtotalAmount = product.price * quantity;
  const totalAmount = subtotalAmount + DELIVERY_FEE;
  const totalDiscount =
    product.originalPrice && product.originalPrice > product.price
      ? (product.originalPrice - product.price) * quantity
      : 0;
  const cartHint =
    lang === 'ar'
      ? 'السلة لمراجعة اختياراتك فقط. الشراء يتم من هذه الصفحة لكل منتج.'
      : 'Le panier sert seulement a revoir vos choix. L achat se fait depuis cette page pour chaque produit.';

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((previousQuantity) => {
      const nextQuantity = increment ? previousQuantity + 1 : previousQuantity - 1;
      return Math.max(1, nextQuantity);
    });
  };

  const validateSelection = () => {
    if (
      (requiresSize && !selectedSize) ||
      (requiresColor && (!selectedColor || disabledColors.has(selectedColor)))
    ) {
      setSelectionError(t('pleaseSelectSizeAndColor'));
      return false;
    }

    setSelectionError('');
    return true;
  };

  const handleSubmitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateSelection()) {
      return;
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone || !/^\+?[0-9\s]+$/.test(trimmedPhone)) {
      setSubmitError(t('pleaseEnterPhone'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: customerName.trim() || t('client'),
            phone: trimmedPhone,
            address: deliveryAddress.trim(),
          },
          items: [
            {
              productId: product._id,
              productName: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              size: selectedSize || '-',
              color: selectedColor || '-',
              quantity,
              images: product.images,
            },
          ],
          totalAmount,
          totalDiscount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      setOrderNumber(result.data.orderNumber);
      setOrderSubmitted(true);
    } catch (error) {
      console.error('Error creating direct order:', error);
      setSubmitError(
        `${t('errorSubmission')}: ${
          error instanceof Error ? error.message : t('errorUnknown')
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex max-w-3xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pt-36">
          <div className="w-full rounded-[2rem] border border-[#e8e8e8] bg-[#fafafa] p-8 text-center shadow-[0_25px_70px_-45px_rgba(0,0,0,0.18)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#111111]">{t('orderConfirmed')}</h1>
            <p className="mt-3 text-base text-[#555555]">{t('orderSuccessMessage')}</p>

            <div className="mt-6 rounded-3xl border border-[#e0e0e0] bg-white px-5 py-4">
              <p className="text-sm uppercase tracking-[0.18em] text-[#777777]">
                {t('orderNumber')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#111111]">{orderNumber}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            <div className="space-y-4 rounded-[1.75rem] border border-[#e6e6e6] bg-[#fafafa] p-4 sm:p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[#111111]">{t('confirmOrder')}</h2>
                <p className="text-sm text-[#666666]">{cartHint}</p>
              </div>

              <div className="rounded-2xl border border-[#e3e3e3] bg-white px-4 py-3">
                <div className="flex items-center justify-between text-sm text-[#666666]">
                  <span>{t('price')}</span>
                  <span>
                    {subtotalAmount.toFixed(2)} {t('dt')}
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
                    {totalAmount.toFixed(2)} {t('dt')}
                  </span>
                </div>
              </div>

              {selectionError && (
                <div className="rounded-2xl border border-[#e3c5c5] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2a2a]">
                  {selectionError}
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-3 border-t border-[#e3e3e3] pt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <User className="mr-2 inline h-4 w-4" />
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder={t('yourFullName')}
                    className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#8a8a8a] focus:border-black focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Phone className="mr-2 inline h-4 w-4" />
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder={t('phoneNumber')}
                    className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#8a8a8a] focus:border-black focus:outline-none"
                    inputMode="tel"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="mr-2 inline h-4 w-4" />
                    {t('deliveryAddress')}
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder={t('yourAddress')}
                    rows={3}
                    className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#8a8a8a] focus:border-black focus:outline-none"
                  />
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-[#e3c5c5] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2a2a]">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-full bg-black py-4 text-sm font-semibold text-white transition-colors hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t('processing') : t('confirmOrder')}
                </button>
              </form>
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
