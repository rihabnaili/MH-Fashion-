"use client";

import React from "react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-black pt-16 sm:pt-20">
      <div className="relative min-h-[380px] bg-black sm:min-h-[520px] lg:min-h-[640px]">
        <Image
          src="/home-media/main_page.png"
          alt="MH Fashion Hero"
          fill
          priority
          sizes="100vw"
          className="bg-black object-contain object-center scale-[1.08] sm:scale-[1.1] lg:scale-[1.12]"
        />
      </div>
    </section>
  );
}
