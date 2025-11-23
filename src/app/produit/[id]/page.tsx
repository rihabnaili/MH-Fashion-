'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import ProductImageGallery from '@/app/components/ui/ProductImageGallery';
import { Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  name: {
    fr: string;
    ar: string;
  };
  price: number;
  originalPrice?: number;
  size: string[];
  color: string[];
  discount: number;
  category: string;
  availability: boolean;
  description: {
    fr: string;
    ar: string;
  };
  images: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const t = useTranslations();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', params.id);
        const response = await fetch(`/api/products/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          setProduct(data.data);
          console.log('Product data set successfully:', data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      console.log('Starting product fetch for ID:', params.id);
      fetchProduct();
    } else {
      console.error('No product ID provided');
      setError('No product ID provided');
      setIsLoading(false);
    }
  }, [params.id]);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      const newQuantity = increment ? prev + 1 : prev - 1;
      return Math.max(1, newQuantity); // Ensure quantity doesn't go below 1
    });
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) return;

    setIsAddingToCart(true);
    try {
      await addToCart(
        product._id,
        selectedSize,
        selectedColor,
        quantity
      );
      // Show success message
      alert(t('addedToCart'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(t('errorAddingToCart'));
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error || t('productNotFound')}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const productName = product.name[lang as keyof typeof product.name] || product.name.fr;
  const productDescription = product.description?.[lang as keyof typeof product.description] || product.description?.fr;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left side - Product Images */}
          <div className="w-full lg:w-1/2">
            <ProductImageGallery
              images={product.images || ['/home-media/set.jpg']}
              productName={productName}
              className="w-full aspect-square"
            />
          </div>

          {/* Right side - Product Info */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Product Title and Price */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{productName}</h1>
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

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {t('size')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm border rounded-lg ${
                      selectedSize === size
                        ? 'border-gold bg-gold text-black'
                        : 'border-gray-300 hover:border-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {t('color')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {product.color.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm border rounded-lg ${
                      selectedColor === color
                        ? 'border-gold bg-gold text-black'
                        : 'border-gray-300 hover:border-gold'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {t('quantity')}
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(false)}
                  className="p-2 border border-gray-300 rounded-lg hover:border-gold"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(true)}
                  className="p-2 border border-gray-300 rounded-lg hover:border-gold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || isAddingToCart}
              className="w-full py-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>{t('addToCart')}</span>
                </>
              )}
            </button>

            {/* Product Description */}
            {productDescription && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('description')}
                </h3>
                <div className="prose prose-sm text-gray-700">
                  {productDescription}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}