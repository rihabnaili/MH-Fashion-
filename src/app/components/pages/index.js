import React from 'react';
import HeroSection from '../sections/HeroSection';
import CategoriesSection from '../sections/CategoriesSection';
import FeaturedProducts from '../sections/FeaturedProducts';
import ProductTabs from '../sections/ProductTabs';
import ServicesSection from '../sections/ServicesSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <ServicesSection />
    </>
  );
};

export default HomePage;