'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import type { StorefrontProduct } from '@/lib/storefrontProducts';

interface CheckoutFormProps {
  product: StorefrontProduct;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  onSuccess?: (orderNumber: string) => void;
}

const DELIVERY_FEE = 8;

export default function CheckoutForm({
  product,
  selectedSize,
  selectedColor,
  quantity,
  onSuccess,
}: CheckoutFormProps) {
  const { lang } = useLanguage();
  const t = useTranslations();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = product.price * quantity;
  const totalAmount = subtotal + DELIVERY_FEE;
  
  const requiresSize = product.size.length > 0;
  const requiresColor = product.color.length > 0;
  const disabledColors = new Set(product.disabledColors || []);
  
  // Check if selections are valid
  const hasValidSelections = 
    (!requiresSize || selectedSize) &&
    (!requiresColor || (selectedColor && !disabledColors.has(selectedColor)));

  const handleSubmitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

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
              quantity: quantity,
              images: product.images,
            },
          ],
          totalAmount,
          totalDiscount: (product.originalPrice || 0) - product.price * quantity || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      setOrderNumber(result.data.orderNumber);
      setOrderSubmitted(true);

      // Reset form after successful submission
      setCustomerName('');
      setPhoneNumber('');
      setDeliveryAddress('');

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data.orderNumber);
      }
    } catch (error) {
      console.error('Error creating order:', error);
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
      <div className="space-y-4 rounded-[1.75rem] border border-[#d7e5d1] bg-[#f5fbf2] p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {lang === 'ar' ? 'تم تأكيد الطلب' : 'Commande confirmée'}
            </h3>
            <p className="text-sm text-gray-600">
              {lang === 'ar' ? `رقم الطلب: ${orderNumber}` : `Numéro de commande: ${orderNumber}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setOrderSubmitted(false);
            window.location.reload();
          }}
          className="w-full rounded-full border border-[#d7d7d7] bg-white py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-black"
        >
          {lang === 'ar' ? 'طلب منتج آخر' : 'Commander un autre produit'}
        </button>
      </div>
    );
  }

  if (!hasValidSelections) {
    return (
      <div className="rounded-2xl border border-[#e3c5c5] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2a2a]">
        {lang === 'ar' ? 'يرجى تحديد كل الخيارات (المقاس واللون) قبل تأكيد الطلب' : 'Veuillez sélectionner toutes les options (taille et couleur) avant de confirmer la commande'}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitOrder} className="space-y-4">
      <div className="space-y-4 rounded-[1.75rem] border border-[#e6e6e6] bg-[#fafafa] p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-[#111111]">
          {lang === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande'}
        </h2>

        {/* Order Summary */}
        <div className="rounded-2xl border border-[#e3e3e3] bg-white px-4 py-3">
          <div className="flex items-center justify-between text-sm text-[#666666]">
            <span>{t('price')}</span>
            <span>
              {subtotal.toFixed(2)} {t('dt')}
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

        {/* Form Fields */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'الاسم' : 'Nom'}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-lg border border-[#e3e3e3] bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
            required
          />
          <input
            type="tel"
            placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-[#e3e3e3] bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
            required
          />
          <textarea
            placeholder={lang === 'ar' ? 'عنوان التسليم' : 'Adresse de livraison'}
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#e3e3e3] bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
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
          className="w-full rounded-full bg-black py-4 text-sm font-semibold text-white transition-colors hover:bg-[#222222] disabled:bg-gray-400"
        >
          {isSubmitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Traitement...') : lang === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande'}
        </button>
      </div>
    </form>
  );
}
