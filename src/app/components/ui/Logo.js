'use client';

const Logo = ({ className = "", tone = "default" }) => {
  const isLight = tone === "light";

  return (
    <div className={`leading-none ${className}`}>
      <span
        className={`block text-[0.54rem] uppercase tracking-[0.42em] ${
          isLight ? "text-white/70" : "text-[#666666]"
        }`}
      >
        Men&apos;s wear
      </span>
      <span
        className={`block font-script text-[2.35rem] tracking-[0.16em] ${
          isLight ? "text-white" : "text-[#111111]"
        }`}
      >
        MH
      </span>
    </div>
  );
};

export default Logo;
