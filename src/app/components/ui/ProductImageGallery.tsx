'use client';

import React, { useState } from 'react';
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
    width: 1200,
    quality: 78,
  });

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={mainImageSrc}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover transition-all duration-300"
          priority={currentImageIndex === 0}
          unoptimized
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${lang === 'ar' ? 'right-2' : 'left-2'}`}
            >
              <ChevronLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={goToNext}
              className={`absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${lang === 'ar' ? 'left-2' : 'right-2'}`}
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
              key={index}
              onClick={() => goToImage(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-gold ring-2 ring-gold/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={buildProductImageUrl(image, { width: 160, quality: 60 })}
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
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
