import React from 'react';
import HeroSection from '../sections/HeroSection';
import FeaturedProducts from '../sections/FeaturedProducts';
import ServicesSection from '../sections/ServicesSection';
import SponsorsSection from '../sections/SponsorsSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <SponsorsSection />
      <ServicesSection />
    </>
  );
};

export default HomePage;
