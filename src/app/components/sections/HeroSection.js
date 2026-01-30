"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import { useProducts } from "@/app/hooks/useProducts";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HeroSection() {
  const t = useTranslations();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const { products } = useProducts({ limit: 1, sortBy: "createdAt", sortOrder: "desc" });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      setCurrentProduct(products[0]);
    }
  }, [products]);

  useEffect(() => {
    if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % currentProduct.images.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [currentProduct]);

  // Handle discover button click
  const handleDiscoverClick = () => {
    if (currentProduct) {
      // Navigate to the product's category page
      router.push(`/category/${currentProduct.category}`);
    } else {
      // Fallback to general products page
      router.push('/products');
    }
  };

  // Get the current image to display
  const getCurrentImage = () => {
    if (currentProduct && currentProduct.images && currentProduct.images.length > 0) {
      return currentProduct.images[currentImageIndex];
    }
    return "/home-media/set.jpg"; // Fallback image
  };

  // Get the product name for alt text
  const getProductName = () => {
    if (currentProduct && currentProduct.name) {
      return currentProduct.name.fr || "Produit vedette";
    }
    return "Produit vedette";
  };

  return (
    <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[250px] sm:min-h-[350px] md:min-h-[400px] bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home-media/main_page.png"
          alt="MH Fashion Hero"
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-black/20 sm:bg-black/30 md:bg-black/40"></div>
      </div>
    </section>
  );
}
