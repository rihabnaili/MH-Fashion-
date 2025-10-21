import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    extend: {
      colors: {
        black: "#000000", // Pure black for buttons and text
        white: "#FFFFFF", // Pure white for backgrounds
        gold: "rgb(177, 134, 65)", // Golden bronze
        red: {
          500: "#EF4444", // Red for original prices
        },
        gray: {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        offwhite: {
          DEFAULT: "#F8F9FA", // Light grey
          50: "#FFFFFF", // Pure white
          100: "#F8F9FA", // Light grey
          200: "#F1F3F4", // Slightly darker grey
          300: "#E8EAED", // Medium light grey
          400: "#DADCE0", // Medium grey
          500: "#9AA0A6", // Darker grey
        },
      },

      fontFamily: {
        cinzel: ["var(--font-cinzel)"],
        montserrat: ["var(--font-montserrat)"],
        // Arabic font families that pair well with Montserrat
        arabic: ["var(--font-noto-sans-arabic)", "Arial", "sans-serif"],
        // Alternative Arabic fonts (choose one)
        // arabic: ["var(--font-cairo)", "Arial", "sans-serif"],
        // arabic: ["var(--font-tajawal)", "Arial", "sans-serif"],
        // arabic: ["var(--font-almarai)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
    plugin(function ({ addVariant }) {
      addVariant("not-read-only", "&:not(:read-only)");
    }),
    require("tailwindcss-rtl"),
  ],
};

export default config;
