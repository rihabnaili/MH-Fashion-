'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { LogOut } from 'lucide-react';
import ImageUploadManager from '@/app/components/admin/ImageUploadManager';
import { PRODUCT_SIZES } from '@/lib/productOptions';

interface ProductFormData {
  name: {
    fr: string;
    ar: string;
  };
  price: string;
  originalPrice: string;
  size: string[];
  color: string[];
  discount: string;
  category: string;
  availability: boolean;
  description: {
    fr: string;
    ar: string;
  };
}

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

const categories = [
  { value: 'ensembles', label: 'Ensembles' },
  { value: 'tShirtsPolos', label: 'T-shirts & Polos' },
  { value: 'shortsPantalons', label: 'Shorts & Pantalons' },
  { value: 'chemises', label: 'Chemises' },
  { value: 'packsOffresSpeciales', label: 'Packs & Offres Spéciales' },
  { value: 'promos', label: 'Promotions' },
  { value: 'nouveautes', label: 'Nouveautés' }
];

export default function EditProductForm() {
  const { lang } = useLanguage();
  const { logout } = useAdminAuth();
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: { fr: '', ar: '' },
    price: '',
    originalPrice: '',
    size: [],
    color: [],
    discount: '0',
    category: '',
    availability: true,
    description: { fr: '', ar: '' }
  });

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        const productData = data.data;
        setProduct(productData);
        setExistingImages(productData.images || []);
        
        // Populate form with existing data
        setFormData({
          name: productData.name,
          price: productData.price.toString(),
          originalPrice: productData.originalPrice?.toString() || '',
          size: productData.size,
          color: productData.color,
          discount: productData.discount.toString(),
          category: productData.category,
          availability: productData.availability,
          description: productData.description
        });
      } else {
        alert(t("errorLoading"));
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert(t("errorLoading"));
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  }, [productId, router, t]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProductFormData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSizeChange = (size: string) => {
    setFormData(prev => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.includes(color)
        ? prev.color.filter(c => c !== color)
        : [...prev.color, color]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Filter out empty strings for validation
      const validColors = formData.color.filter(c => c.trim() !== '');
      const validSizes = formData.size.filter(s => s.trim() !== '');
      
      // Validate required fields
      if (!formData.name.fr || !formData.name.ar || !formData.price || 
          validSizes.length === 0 || validColors.length === 0 || !formData.category) {
        alert(t("pleaseFillRequiredFields"));
        setIsSaving(false);
        return;
      }

      // Filter out empty strings from arrays
      const filteredColors = formData.color.filter(c => c.trim() !== '');
      const filteredSizes = formData.size.filter(s => s.trim() !== '');
      
      // Validate arrays are not empty after filtering
      if (filteredColors.length === 0 || filteredSizes.length === 0) {
        alert(t("pleaseFillRequiredFields"));
        setIsSaving(false);
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add product data
      formDataToSend.append('productData', JSON.stringify({
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        size: filteredSizes,
        color: filteredColors,
        discount: parseFloat(formData.discount),
        category: formData.category,
        availability: formData.availability,
        description: formData.description
      }));

      // Add new images
      images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      // Add existing images that weren't removed
      existingImages.forEach((imagePath) => {
        formDataToSend.append(`images`, imagePath);
      });

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (response.ok) {
        alert(t("productUpdatedSuccessfully"));
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(`${t("error")}: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(t("productUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm(t("confirmLogout"))) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
          {/* Header with logout button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-montserrat text-center sm:text-left">
              {t("editProduct")}
            </h1>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("logout")}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-lg text-gray-600">{t("loadingProduct")}</div>
            </div>
          ) : !product ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-red-600 text-lg mb-4">{t("productNotFound")}</div>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
              >
                {t("back")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Product Names */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("nameFrench")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name.fr}
                    onChange={(e) => handleInputChange('name.fr', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder={t("productNameFrench")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("nameArabic")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name.ar}
                    onChange={(e) => handleInputChange('name.ar', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder={t("productNameArabic")}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("priceTND")} *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("originalPriceTND")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="39.99"
                  />
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  {t("availableSizes")} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                  {PRODUCT_SIZES.map((size) => (
                    <label key={size} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.size.includes(size)}
                        onChange={() => handleSizeChange(size)}
                        className="mr-2 w-3 h-3 sm:w-4 sm:h-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="text-xs sm:text-sm font-medium">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  {t("availableColors")} *
                </label>
                <div className="space-y-3">
                  {formData.color.map((color, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => {
                          const newColors = [...formData.color];
                          newColors[index] = e.target.value;
                          setFormData(prev => ({ ...prev, color: newColors }));
                        }}
                        className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        placeholder={t("colorName")}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newColors = formData.color.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, color: newColors }));
                        }}
                        className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm sm:text-base"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: [...prev.color, ''] }))}
                    className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium text-sm sm:text-base"
                  >
                    {t("addColor")}
                  </button>
                </div>
              </div>

              {/* Discount and Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("discountPercent")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("category")} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="">{t("selectCategory")}</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.checked)}
                    className="mr-3 w-4 h-4 sm:w-5 sm:h-5 text-gold focus:ring-gold border-gray-300 rounded"
                  />
                  <span className="text-sm sm:text-base font-medium text-gray-700">
                    {t("productIsAvailable")}
                  </span>
                </label>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("descriptionFrench")}
                  </label>
                  <textarea
                    value={formData.description.fr}
                    onChange={(e) => handleInputChange('description.fr', e.target.value)}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder={t("productDescriptionFrench")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {t("descriptionArabic")}
                  </label>
                  <textarea
                    value={formData.description.ar}
                    onChange={(e) => handleInputChange('description.ar', e.target.value)}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder={t("productDescriptionArabic")}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Image Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  {t("imageManagement")}
                </label>
                <ImageUploadManager
                  images={images}
                  existingImages={existingImages}
                  onImagesChange={setImages}
                  onExistingImagesChange={setExistingImages}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gold text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md text-sm sm:text-base"
                >
                  {isSaving ? t("saving") : t("saveChanges")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
