'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import ProductImageGallery from './ProductImageGallery';

interface ProductQuickViewProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { lang } = useLanguage();
  const t = useTranslations();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!isOpen || !product) return null;

  const productName = product.name?.[lang] || product.name?.fr || t("productName");
  const productImage = product.images?.[0] || '/home-media/set.jpg';

  // Available sizes and colors (you can customize these based on your product data)
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    t("red"), t("blue"), t("green"), t("black"), t("white"), t("gray")
  ];

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert(t("pleaseSelectSizeAndColor"));
      return;
    }

    setIsAddingToCart(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addToCart(product, selectedSize, selectedColor, quantity);
      setIsAddingToCart(false);
      onClose();
      
      // Reset form
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
    }, 500);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Modern background overlay with glassmorphism effect */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all duration-300" 
          onClick={onClose}
        />

        {/* Modern modal with glassmorphism and better animations */}
        <div className="inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-10 border border-gray-200 max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto">
          {/* Modern header with glassmorphism */}
          <div className="bg-black px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Ajouter au panier
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-all duration-200 p-1 sm:p-2 rounded-full hover:bg-white/30 hover:scale-110"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Modern content with better layout */}
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col lg:flex-row space-y-4 sm:space-y-8 lg:space-y-0 lg:space-x-8">
              {/* Product Image with modern styling */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <ProductImageGallery
                  images={product.images || ['/home-media/set.jpg']}
                  productName={productName}
                  className="w-48 sm:w-72"
                />
              </div>

              {/* Product Details with modern layout */}
              <div className="flex-1 space-y-4 sm:space-y-6">
                <div>
                  <h4 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                    {productName}
                  </h4>
                  
                  {/* Modern price display */}
                  <div className="mb-4 sm:mb-6">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className="text-2xl sm:text-3xl font-bold text-black">
                          {product.price.toFixed(2)} {t('dt')}
                        </span>
                        <span className="text-lg sm:text-xl text-gray-400 line-through">
                          {product.originalPrice.toFixed(2)} {t('dt')}
                        </span>
                        <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-full w-fit">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-black">
                        {product.price.toFixed(2)} {t('dt')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Modern size selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-4 uppercase tracking-wide">
                    Taille *
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`p-2 sm:p-4 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          selectedSize === size
                            ? 'border-black bg-black text-white shadow-lg scale-105'
                            : 'border-gray-200 text-gray-700 hover:border-black hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modern color selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-4 uppercase tracking-wide">
                    Couleur *
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`p-2 sm:p-4 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          selectedColor === color
                            ? 'border-black bg-black text-white shadow-lg scale-105'
                            : 'border-gray-200 text-gray-700 hover:border-black hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modern quantity selector */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-4 uppercase tracking-wide">
                    Quantité
                  </label>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-black/50 hover:shadow-md hover:scale-105"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <span className="w-12 sm:w-16 text-center text-lg sm:text-xl font-bold text-gray-900 bg-gray-50 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:border-black/50 hover:shadow-md hover:scale-105"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Modern add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor || isAddingToCart}
                  className="w-full px-4 sm:px-8 py-3 sm:py-5 bg-black text-white rounded-xl sm:rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-sm sm:text-lg flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Ajout en cours...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </button>

                {/* Modern validation message */}
                {(!selectedSize || !selectedColor) && (
                  <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-red-600 font-medium">
                      ⚠️ Veuillez sélectionner une taille et une couleur
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
