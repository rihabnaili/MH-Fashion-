import React from 'react';
import HeroSection from '../sections/HeroSection';
import FeaturedProducts from '../sections/FeaturedProducts';
import ServicesSection from '../sections/ServicesSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <ServicesSection />
    </>
  );
};

export default HomePage;
