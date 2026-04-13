'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { buildProductImageUrl } from '@/lib/imageUrl';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ProductImageGallery({ images, productName, className = '' }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { lang } = useLanguage();

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Aucune image</span>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const mainImageSrc = buildProductImageUrl(images[currentImageIndex], {
    variant: 'detail',
  });

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#f6f1ea]">
        <Image
          src={mainImageSrc}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-contain p-4 transition-all duration-300 sm:p-6"
          priority={currentImageIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
          unoptimized
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label={lang === 'ar' ? 'الصورة السابقة' : 'Image precedente'}
              className={`absolute top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-3 text-gray-800 shadow-lg transition-all duration-200 touch-manipulation pointer-events-auto hover:bg-white ${lang === 'ar' ? 'right-3' : 'left-3'}`}
            >
              <ChevronLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label={lang === 'ar' ? 'الصورة التالية' : 'Image suivante'}
              className={`absolute top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-3 text-gray-800 shadow-lg transition-all duration-200 touch-manipulation pointer-events-auto hover:bg-white ${lang === 'ar' ? 'left-3' : 'right-3'}`}
            >
              <ChevronRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {images.map((image, index) => (
            <button
              type="button"
              key={index}
              onClick={() => goToImage(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-gold ring-2 ring-gold/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={buildProductImageUrl(image, { variant: 'thumb' })}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
          {currentImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
