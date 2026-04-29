'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { buildProductImageUrl } from '@/lib/imageUrl';

export default function CartSidebar() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
  } = useCart();
  const { lang, isRTL } = useLanguage();
  const t = useTranslations();

  const totalItems = getTotalItems();
  const continueShoppingLabel = lang === 'ar' ? 'مواصلة التسوق' : 'Continuer les achats';
  const emptyCartLabel = lang === 'ar' ? 'سلتك فارغة' : 'Votre panier est vide';
  const emptyCartDescription =
    lang === 'ar'
      ? 'السلة هنا فقط لمراجعة ما أضفته. لإتمام الشراء، افتح صفحة المنتج المطلوب وأكد الطلب من هناك.'
      : 'Le panier sert uniquement a revoir ce que vous avez ajoute. Pour acheter, ouvrez la page du produit souhaite puis confirmez la commande depuis cette page.';
  const buyFromProductLabel =
    lang === 'ar' ? 'الشراء يتم من صفحة المنتج' : 'L achat se fait depuis la page produit';

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

  const handleClose = () => {
    closeCart();
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

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-14 w-14 text-[#c6c6c6]" />
              <h2 className="mt-4 text-xl font-semibold text-[#111111]">{emptyCartLabel}</h2>
              <p className="mt-2 max-w-xs text-sm text-[#666666]">{emptyCartDescription}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[1.4rem] border border-[#e6e6e6] bg-[#fafafa] px-4 py-3 text-sm">
                <p className="font-semibold text-[#111111]">{buyFromProductLabel}</p>
                <p className="mt-1 text-[#666666]">
                  {lang === 'ar'
                    ? 'استخدم هذه السلة لمراجعة اختياراتك. كل منتج يتم طلبه من صفحته الخاصة.'
                    : 'Utilisez ce panier pour revoir vos choix. Chaque produit se commande depuis sa propre page.'}
                </p>
              </div>

              {items.map((item) => {
                const itemName = item.name[lang as 'fr' | 'ar'] || item.name.fr;
                return (
                  <div
                    key={item.cartItemId}
                    className="rounded-[1.5rem] border border-[#e7e7e7] bg-[#fafafa] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/produit/${item._id}`}
                        onClick={handleClose}
                        className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white"
                      >
                        <Image
                          src={buildProductImageUrl(item.images?.[0], { variant: 'thumb' })}
                          alt={itemName}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/produit/${item._id}`}
                              onClick={handleClose}
                              className="text-sm font-semibold text-[#111111] hover:underline"
                            >
                              {itemName}
                            </Link>
                            <p className="mt-1 text-xs text-[#666666]">
                              {t('size')}: {item.size || '-'} | {t('color')}: {item.color || '-'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cartItemId)}
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
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7d7d7] text-[#111111]"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-[#111111]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
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
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
            >
              {continueShoppingLabel}
            </button>
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
      </aside>
    </div>
  );
}
