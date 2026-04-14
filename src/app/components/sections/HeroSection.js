"use client";

import React from "react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-black pt-16 sm:pt-20">
      <div className="relative min-h-[320px] bg-black sm:min-h-[420px] lg:aspect-[1920/559] lg:min-h-0">
        <Image
          src="/home-media/main_page.png"
          alt="MH Fashion Hero"
          fill
          priority
          sizes="100vw"
          className="bg-black object-cover object-center scale-150"
        />
      </div>
    </section>
  );
}
