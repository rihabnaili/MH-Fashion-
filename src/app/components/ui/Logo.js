'use client';

const Logo = ({ className = "", tone = "default" }) => {
  const isLight = tone === "light";

  return (
    <div className={`leading-none ${className}`}>
      <span
        className={`block text-[0.54rem] uppercase tracking-[0.42em] ${
          isLight ? "text-[#d8c4b2]" : "text-[#8f6a4d]"
        }`}
      >
        Men&apos;s wear
      </span>
      <span
        className={`block font-script text-[2.35rem] tracking-[0.16em] ${
          isLight ? "text-[#fff8f1]" : "text-[#24160d]"
        }`}
      >
        MH
      </span>
    </div>
  );
};

export default Logo;
