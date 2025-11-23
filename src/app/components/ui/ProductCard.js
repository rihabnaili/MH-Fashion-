import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";

const ProductCard = ({ product }) => {
  const t = useTranslations();
  const { lang } = useLanguage();
  const router = useRouter();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleBuyClick = () => {
    // Add to cart without size/color (user will select on cart page)
    addToCart(product, '', '', 1);
    // Redirect to cart page
    router.push('/panier');
  };

  // Calculate discount percentage
  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get product name in current language
  const productName = product.name?.[lang] || product.name?.fr || t("productName");

  // Get first image or fallback
  const productImage = product.images?.[0] || '/home-media/set.jpg';

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative border-2 border-black">
        <div className="relative">
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
            {imageError ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Image non disponible</span>
              </div>
            ) : (
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-contain bg-gray-100"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )}
            
          </div>
          
          {/* Black separator line between image and content */}
          <div className="w-full h-0.5 bg-black"></div>
        </div>

        <div className="p-3 text-center">
          <h3 className="font-medium text-black mb-2 text-sm">{productName}</h3>
          
          {/* Price section - matching the design */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-red-500 line-through">
                {product.originalPrice.toFixed(1)} د.ت
              </span>
            )}
            <span className="text-sm font-bold text-black">
              {product.price.toFixed(1)} د.ت
            </span>
          </div>
          
          {/* Buy button - matching the design */}
          <button 
            onClick={handleBuyClick}
            className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded text-sm font-medium transition-colors"
          >
            {lang === 'ar' ? 'شراء' : 'Acheter'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
