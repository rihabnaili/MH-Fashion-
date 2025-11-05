'use client';

import React, { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import Image from 'next/image';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Plus, Minus, Trash2, ShoppingBag, Phone, User, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalDiscount } = useCart();
  const { lang } = useLanguage();
  const t = useTranslations();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const totalPrice = getTotalPrice();
  const totalDiscount = getTotalDiscount();

  const handleQuantityChange = (itemId: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, size, color, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string, size: string, color: string) => {
    removeFromCart(itemId, size, color);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if phone number is filled and only numbers
    if (!phoneNumber.trim() || !/^[0-9]+$/.test(phoneNumber.trim())) {
      alert(t("pleaseEnterPhone"));
      return;
    }

    if (items.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customer: {
          name: customerName.trim() || t("client"),
          phone: phoneNumber.trim(),
          address: deliveryAddress.trim()
        },
        items: items.map(item => ({
          productId: item._id,
          productName: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          images: item.images
        })),
        totalAmount: totalPrice,
        totalDiscount: totalDiscount
      };

      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const result = await response.json();
      
      if (result.success) {
        // Set order number from database
        setOrderNumber(result.data.orderNumber);
        
        // Clear cart
        clearCart();
        
        // Show success
        setOrderSubmitted(true);
      } else {
        throw new Error(result.message || 'Failed to create order');
      }

    } catch (error) {
      alert(`${t("errorSubmission")}: ${error instanceof Error ? error.message : t("errorUnknown")}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-white pt-20 sm:pt-32">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t("orderConfirmed")} !
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {t("orderSuccessMessage")}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-2">{t("orderNumber")}:</p>
              <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20 sm:pt-32">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Ajoutez des produits pour commencer vos achats
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 sm:pt-32">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Panier ({items.length} article{items.length > 1 ? 's' : ''})
                </h1>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium self-start sm:self-auto"
                >
                  Vider le panier
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={`${item._id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                    {/* Product Image and Details */}
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={item.images[0] || '/home-media/set.jpg'}
                            alt={item.name[lang as 'fr' | 'ar'] || item.name.fr}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                          {item.name[lang as keyof typeof item.name] || item.name.fr}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Taille: {item.size} | Couleur: {item.color}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {item.originalPrice && item.originalPrice > item.price ? (
                            <>
                              <span className="font-medium text-black text-sm sm:text-base">
                                {item.price.toFixed(2)} {t('dt')}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-400 line-through">
                                {item.originalPrice.toFixed(2)} {t('dt')}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium text-black text-sm sm:text-base">
                              {item.price.toFixed(2)} {t('dt')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls and Total */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.size, item.color, item.quantity - 1)}
                          className="p-1 sm:p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.size, item.color, item.quantity + 1)}
                          className="p-1 sm:p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className={`${lang === 'ar' ? 'text-left' : 'text-right'} min-w-0`}>
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {(item.price * item.quantity).toFixed(2)} {t('dt')}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id, item.size, item.color)}
                        className="p-1 sm:p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 lg:sticky lg:top-32">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Finaliser la commande
              </h2>

              <form onSubmit={handleSubmitOrder} className="space-y-4 sm:space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t("yourFullName")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t("phoneNumber")}
                    required
               inputMode="numeric"
               pattern="[0-9]*"
               className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t("deliveryAddress")}
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={t("yourAddress")}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black text-base"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-3">
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Économies:</span>
                      <span className="text-green-600">-{totalDiscount.toFixed(2)} {t('dt')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>{t("total")}:</span>
                    <span>{totalPrice.toFixed(2)} {t('dt')}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full px-6 py-4 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("processing")}</span>
                      </div>
                    ) : (
                      t("confirmOrder")
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {lang === 'ar' ? '←' : '←'} Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
