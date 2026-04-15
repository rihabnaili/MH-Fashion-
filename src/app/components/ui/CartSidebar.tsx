'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { buildProductImageUrl } from '@/lib/imageUrl';

const DELIVERY_FEE = 8;

export default function CartSidebar() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalDiscount,
  } = useCart();
  const { lang, isRTL } = useLanguage();
  const t = useTranslations();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const totalDiscount = getTotalDiscount();
  const totalAmount = items.length > 0 ? subtotal + DELIVERY_FEE : 0;
  const continueShoppingLabel = lang === 'ar' ? 'مواصلة التسوق' : 'Continuer les achats';
  const emptyCartLabel = lang === 'ar' ? 'سلتك فارغة' : 'Votre panier est vide';
  const emptyCartDescription =
    lang === 'ar'
      ? 'أضف المنتجات والقياسات والألوان التي تريدها ثم أكد الطلب من هنا.'
      : 'Ajoutez les produits, tailles et couleurs souhaités puis confirmez la commande ici.';

  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCartOpen]);

  const resetCheckoutState = () => {
    setCustomerName('');
    setPhoneNumber('');
    setDeliveryAddress('');
    setIsSubmitting(false);
    setSubmitError('');
    setOrderSubmitted(false);
    setOrderNumber('');
  };

  const handleClose = () => {
    closeCart();

    if (!items.length) {
      resetCheckoutState();
    }
  };

  const handleSubmitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone || !/^\+?[0-9\s]+$/.test(trimmedPhone)) {
      setSubmitError(t('pleaseEnterPhone'));
      return;
    }

    if (!items.length) {
      setSubmitError(t('cartEmpty'));
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
          items: items.map((item) => ({
            productId: item._id,
            productName: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            size: item.size || '-',
            color: item.color || '-',
            quantity: item.quantity,
            images: item.images,
          })),
          totalAmount,
          totalDiscount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      clearCart();
      setOrderNumber(result.data.orderNumber);
      setOrderSubmitted(true);
    } catch (error) {
      console.error('Error creating cart order:', error);
      setSubmitError(
        `${t('errorSubmission')}: ${
          error instanceof Error ? error.message : t('errorUnknown')
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/45" onClick={handleClose} />

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`absolute inset-y-0 ${
          isRTL ? 'left-0' : 'right-0'
        } flex w-full max-w-[440px] flex-col border-l border-[#e2e2e2] bg-white shadow-[-24px_0_80px_-48px_rgba(0,0,0,0.35)]`}
      >
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">{t('cart')}</p>
              <p className="text-xs text-[#6f6f6f]">
                {totalItems} {lang === 'ar' ? 'عنصر' : 'article'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d7d7] text-[#111111] transition-colors hover:border-black"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {orderSubmitted ? (
          <div className="flex flex-1 flex-col justify-center px-5 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#111111]">{t('orderConfirmed')}</h2>
            <p className="mt-2 text-sm text-[#666666]">{t('orderSuccessMessage')}</p>
            <div className="mt-6 rounded-3xl border border-[#e3e3e3] bg-[#fafafa] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#767676]">
                {t('orderNumber')}
              </p>
              <p className="mt-2 text-xl font-semibold text-[#111111]">{orderNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetCheckoutState();
                closeCart();
              }}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
            >
              {continueShoppingLabel}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="h-14 w-14 text-[#c6c6c6]" />
                  <h2 className="mt-4 text-xl font-semibold text-[#111111]">{emptyCartLabel}</h2>
                  <p className="mt-2 max-w-xs text-sm text-[#666666]">{emptyCartDescription}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemName = item.name[lang as 'fr' | 'ar'] || item.name.fr;
                    return (
                      <div
                        key={`${item._id}-${item.size}-${item.color}`}
                        className="rounded-[1.5rem] border border-[#e7e7e7] bg-[#fafafa] p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white">
                            <Image
                              src={buildProductImageUrl(item.images?.[0], { variant: 'thumb' })}
                              alt={itemName}
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-semibold text-[#111111]">{itemName}</h3>
                                <p className="mt-1 text-xs text-[#666666]">
                                  {t('size')}: {item.size || '-'} | {t('color')}: {item.color || '-'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item._id, item.size, item.color)}
                                className="text-[#8b8b8b] transition-colors hover:text-[#c73030]"
                                aria-label={t('delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item._id, item.size, item.color, item.quantity - 1)
                                  }
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7d7d7] text-[#111111]"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-7 text-center text-sm font-semibold text-[#111111]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item._id, item.size, item.color, item.quantity + 1)
                                  }
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7d7d7] text-[#111111]"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <p className="text-sm font-semibold text-[#111111]">
                                {(item.price * item.quantity).toFixed(2)} {t('dt')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[#e6e6e6] bg-white px-5 py-4">
              {items.length > 0 ? (
                <form onSubmit={handleSubmitOrder} className="space-y-3">
                  <div className="rounded-[1.4rem] border border-[#e6e6e6] bg-[#fafafa] px-4 py-3 text-sm">
                    <div className="flex items-center justify-between text-[#666666]">
                      <span>{t('price')}</span>
                      <span>
                        {subtotal.toFixed(2)} {t('dt')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[#666666]">
                      <span>{t('deliveryFees')}</span>
                      <span>
                        +{DELIVERY_FEE.toFixed(2)} {t('dt')}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="mt-2 flex items-center justify-between text-[#666666]">
                        <span>Remise</span>
                        <span>
                          -{totalDiscount.toFixed(2)} {t('dt')}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-[#dfdfdf] pt-3 text-base font-semibold text-[#111111]">
                      <span>{t('total')}</span>
                      <span>
                        {totalAmount.toFixed(2)} {t('dt')}
                      </span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder={t('yourFullName')}
                    className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#8a8a8a] focus:border-black focus:outline-none"
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder={t('phoneNumber')}
                    className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#8a8a8a] focus:border-black focus:outline-none"
                    inputMode="tel"
                    required
                  />
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder={t('yourAddress')}
                    rows={3}
                    className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#8a8a8a] focus:border-black focus:outline-none"
                  />

                  {submitError && (
                    <div className="rounded-2xl border border-[#e3c5c5] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2a2a]">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full border border-[#d7d7d7] px-4 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-black"
                    >
                      {continueShoppingLabel}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? t('processing') : t('confirmOrder')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
                  >
                    {continueShoppingLabel}
                  </button>
                  <Link
                    href="/tous-nos-produits"
                    onClick={handleClose}
                    className="block text-center text-sm text-[#666666] underline"
                  >
                    {t('tousNosProduits')}
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
