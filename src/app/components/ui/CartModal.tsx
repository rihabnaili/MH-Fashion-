'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import ProductImageGallery from './ProductImageGallery';
import Link from 'next/link';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, getTotalDiscount } = useCart();
  const { lang } = useLanguage();
  const t = useTranslations();

  if (!isOpen) return null;

  const handleQuantityChange = (itemId: string, size: string, color: string, newQuantity: number) => {
    updateQuantity(itemId, size, color, newQuantity);
  };

  const handleRemoveItem = (itemId: string, size: string, color: string) => {
    removeFromCart(itemId, size, color);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const totalDiscount = getTotalDiscount();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[95vh] w-[95vw] sm:w-full">
          {/* Header */}
          <div className="bg-black px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Panier ({totalItems})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Votre panier est vide
                </h4>
                <p className="text-gray-500 mb-6">
                  Ajoutez des produits pour commencer vos achats
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Continuer les achats
                </button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {items.map((item, index) => (
                  <div key={`${item._id}-${item.size}-${item.color}`} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile: Stacked Layout */}
                    <div className="block sm:hidden">
                      {/* Product Image and Basic Info */}
                      <div className="flex items-center space-x-3 p-3">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.images[0] || '/home-media/set.jpg'}
                              alt={item.name[lang as 'fr' | 'ar'] || item.name.fr}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-900 truncate">
                            {item.name[lang as 'fr' | 'ar'] || item.name.fr}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {item.size} | {item.color}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-black">
                            {item.price.toFixed(2)} {t('dt')}
                          </div>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <div className="text-xs text-gray-400 line-through">
                              {item.originalPrice.toFixed(2)} {t('dt')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Controls Row */}
                      <div className="flex items-center justify-between px-3 pb-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.size, item.color, item.quantity - 1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.size, item.color, item.quantity + 1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-medium text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} {t('dt')}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item._id, item.size, item.color)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Horizontal Layout */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-4 p-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={item.images[0] || '/home-media/set.jpg'}
                            alt={item.name[lang as 'fr' | 'ar'] || item.name.fr}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {item.name[lang as 'fr' | 'ar'] || item.name.fr}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Taille: {item.size} | Couleur: {item.color}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {item.originalPrice && item.originalPrice > item.price ? (
                            <>
                              <span className="text-base font-medium text-black">
                                {item.price.toFixed(2)} {t('dt')}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {item.originalPrice.toFixed(2)} {t('dt')}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-medium text-black">
                              {item.price.toFixed(2)} {t('dt')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.size, item.color, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.size, item.color, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-0">
                        <div className="font-medium text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} {t('dt')}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id, item.size, item.color)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4">
              {/* Summary */}
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>Économies:</span>
                    <span className="text-green-600 font-medium">-{totalDiscount.toFixed(2)} {t('dt')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-lg sm:text-xl">{totalPrice.toFixed(2)} {t('dt')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm text-center"
                >
                  Continuer les achats
                </button>
                <Link
                  href="/panier"
                  onClick={onClose}
                  className="w-full block px-4 py-3 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  {t("viewCart")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}