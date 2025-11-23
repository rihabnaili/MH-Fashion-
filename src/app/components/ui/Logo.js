'use client';
import Image from 'next/image';

const Logo = () => {
  return (
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="MH Fashion Logo"
          width={80}
          height={80}
          className="object-contain"
          unoptimized
          priority
        />
      </div>
  );
};

export default Logo;
