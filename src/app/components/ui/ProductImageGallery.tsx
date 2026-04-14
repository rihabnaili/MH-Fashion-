'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [loadedMainImages, setLoadedMainImages] = useState<Record<string, true>>({});
  const [thumbnailSources, setThumbnailSources] = useState<string[]>([]);
  const { lang } = useLanguage();
  const prefetchedMainImagesRef = useRef<Set<string>>(new Set());

  const imageSources = useMemo(
    () =>
      images.map((image) => ({
        blur: buildProductImageUrl(image, { variant: 'blur' }),
        thumb: buildProductImageUrl(image, { variant: 'thumb' }),
        main: buildProductImageUrl(image, { variant: 'gallery' }),
      })),
    [images]
  );

  useEffect(() => {
    setCurrentImageIndex(0);
    setLoadedMainImages({});
    prefetchedMainImagesRef.current.clear();
    setThumbnailSources(imageSources.map((imageSource) => imageSource.thumb));
  }, [imageSources]);

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const currentImage = imageSources[currentImageIndex];
  const isCurrentMainImageLoaded = !!(currentImage && loadedMainImages[currentImage.main]);

  const markMainImageLoaded = (src: string) => {
    setLoadedMainImages((previousImages) => {
      if (previousImages[src]) {
        return previousImages;
      }

      return {
        ...previousImages,
        [src]: true,
      };
    });
  };

  const handleThumbnailError = (index: number) => {
    setThumbnailSources((previousSources) => {
      const nextSources = [...previousSources];
      const fallbackSource = imageSources[index]?.main || images[index];

      if (!fallbackSource || nextSources[index] === fallbackSource) {
        return previousSources;
      }

      nextSources[index] = fallbackSource;
      return nextSources;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined' || imageSources.length <= 1) {
      return;
    }

    const orderedMainSources = [
      imageSources[currentImageIndex]?.main,
      imageSources[(currentImageIndex + 1) % imageSources.length]?.main,
      imageSources[(currentImageIndex - 1 + imageSources.length) % imageSources.length]?.main,
      ...imageSources.map((imageSource) => imageSource.main),
    ].filter((src): src is string => Boolean(src));

    const sourcesToPrefetch = Array.from(new Set(orderedMainSources)).filter((src) => {
      return !prefetchedMainImagesRef.current.has(src);
    });

    const prefetchImage = (src: string) => {
      prefetchedMainImagesRef.current.add(src);
      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
    };

    sourcesToPrefetch.slice(0, 2).forEach(prefetchImage);

    const deferredSources = sourcesToPrefetch.slice(2);
    if (!deferredSources.length) {
      return;
    }

    const runDeferredPrefetch = () => {
      deferredSources.forEach(prefetchImage);
    };

    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(runDeferredPrefetch, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = globalThis.setTimeout(runDeferredPrefetch, 180);
    return () => globalThis.clearTimeout(timeoutId);
  }, [currentImageIndex, imageSources]);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Aucune image</span>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#f3f3f3]">
        {currentImage && !isCurrentMainImageLoaded && (
          <Image
            src={currentImage.blur}
            alt=""
            aria-hidden="true"
            fill
            className="scale-110 object-cover blur-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
            unoptimized
          />
        )}
        <Image
          src={currentImage?.main || images[currentImageIndex]}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          className={`object-contain p-4 transition-all duration-300 sm:p-6 ${
            isCurrentMainImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority={currentImageIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
          onLoad={() => {
            if (currentImage?.main) {
              markMainImageLoaded(currentImage.main);
            }
          }}
          onError={() => {
            if (currentImage?.main) {
              markMainImageLoaded(currentImage.main);
            }
          }}
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
                  ? 'border-black ring-2 ring-black/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={
                  thumbnailSources[index] ||
                  imageSources[index]?.thumb ||
                  buildProductImageUrl(image, { variant: 'thumb' })
                }
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                onError={() => handleThumbnailError(index)}
                unoptimized
              />
              {index === currentImageIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
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
