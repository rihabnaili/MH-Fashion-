'use client';

import React, { useState } from 'react';
import { useCart, CartItem } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import Image from 'next/image';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Plus, Minus, Trash2, ShoppingBag, Phone, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Cart Item Component
const CartItemCard = ({ 
  item, 
  index, 
  lang, 
  t, 
  onSizeChange, 
  onColorChange, 
  onQuantityChange, 
  onRemove 
}: {
  item: CartItem;
  index: number;
  lang: string;
  t: (key: string) => string;
  onSizeChange: (itemId: string, oldSize: string, oldColor: string, newSize: string) => void;
  onColorChange: (itemId: string, oldSize: string, oldColor: string, newColor: string) => void;
  onQuantityChange: (itemId: string, size: string, color: string, quantity: number) => void;
  onRemove: (itemId: string, size: string, color: string) => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productImages = item.images && item.images.length > 0 ? item.images : ['/home-media/set.jpg'];
  
  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left Side - Image Gallery */}
        <div className="lg:w-1/2">
          <div className="relative group">
            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
              <Image
                src={productImages[currentImageIndex]}
                alt={item.name[lang as 'fr' | 'ar'] || item.name.fr}
                fill
                className="object-contain bg-gray-100"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className={`absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${lang === 'ar' ? 'right-4' : 'left-4'}`}
                  >
                    <ChevronLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className={`absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${lang === 'ar' ? 'left-4' : 'right-4'}`}
                  >
                    <ChevronRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="px-4 py-3 flex justify-center space-x-2 overflow-x-auto bg-gray-50">
                {productImages.map((image, imgIndex) => (
                  <button
                    key={imgIndex}
                    onClick={() => goToImage(imgIndex)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all duration-200 ${
                      imgIndex === currentImageIndex
                        ? 'border-black ring-2 ring-black/20'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${item.name[lang as 'fr' | 'ar'] || item.name.fr} - Thumbnail ${imgIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Product Details */}
        <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
          {/* Product Name */}
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
            {item.name[lang as keyof typeof item.name] || item.name.fr}
          </h2>

          {/* Product Description */}
          {item.description && item.description[lang as 'fr' | 'ar'] && (
            <p className="text-sm text-gray-600 mb-4">
              {item.description[lang as 'fr' | 'ar']}
            </p>
          )}

          {/* Available Sizes Text */}
          {item.availableSizes && item.availableSizes.length > 0 && (
            <p className="text-sm text-gray-700 mb-2">
              {t("availableSizes")}: {item.availableSizes.join('-')}
            </p>
          )}

          {/* Category */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              {t("category")}: <span className="font-medium">{t(item.category) || item.category}</span>
            </span>
          </div>

          {/* Price with Delivery */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              {t("price")}: {item.price.toFixed(1)} {t('dt')} + 8 {t("deliveryFees") || "frais de livraison"}
            </p>
          </div>

          {/* Size Selection - Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("size")}: {!item.size && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {(item.availableSizes || []).map((size: string) => (
                <button
                  key={size}
                  onClick={() => onSizeChange(item._id, item.size, item.color, size)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all duration-200 ${
                    item.size === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection - Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("color")}: {!item.color && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {(item.availableColors || []).map((color: string) => (
                <button
                  key={color}
                  onClick={() => onColorChange(item._id, item.size, item.color, color)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all duration-200 ${
                    item.color === color
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Price Display */}
          <div className="mb-4">
            {item.originalPrice && item.originalPrice > item.price ? (
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-black">
                  {item.price.toFixed(1)} {t('dt')}
                </span>
                <span className="text-lg text-red-500 line-through">
                  {item.originalPrice.toFixed(1)} {t('dt')}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-black">
                {item.price.toFixed(1)} {t('dt')}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("quantity") || "Quantité"}:
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onQuantityChange(item._id, item.size, item.color, item.quantity - 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Minus className="w-5 h-5 text-gray-600" />
              </button>
              <span className="w-12 text-center text-lg font-medium text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item._id, item.size, item.color, item.quantity + 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Item Total */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-900">
              {t("total")}: {(item.price * item.quantity).toFixed(2)} {t('dt')}
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item._id, item.size, item.color)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg text-sm font-medium transition-colors"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, updateItemSizeColor, clearCart, getTotalPrice, getTotalDiscount } = useCart();
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

  const handleSizeChange = (itemId: string, oldSize: string, oldColor: string, newSize: string) => {
    updateItemSizeColor(itemId, oldSize, oldColor, newSize, oldColor);
  };

  const handleColorChange = (itemId: string, oldSize: string, oldColor: string, newColor: string) => {
    updateItemSizeColor(itemId, oldSize, oldColor, oldSize, newColor);
  };

  // Check if all items have size and color selected
  const allItemsHaveSizeColor = items.every(item => item.size && item.color);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all items have size and color selected
    if (!allItemsHaveSizeColor) {
      alert(t("pleaseSelectSizeAndColor") || "Veuillez sélectionner une taille et une couleur pour tous les articles");
      return;
    }

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

              <div className="space-y-6">
                {items.map((item, index) => (
                  <CartItemCard
                    key={`${item._id}-${item.size || 'no-size'}-${item.color || 'no-color'}-${index}`}
                    item={item}
                    index={index}
                    lang={lang}
                    t={t}
                    onSizeChange={handleSizeChange}
                    onColorChange={handleColorChange}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
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
                  {!allItemsHaveSizeColor && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ {t("pleaseSelectSizeAndColor") || "Veuillez sélectionner une taille et une couleur pour tous les articles"}
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0 || !allItemsHaveSizeColor}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
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
