"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(isOpen);

  // Manage visibility with transition
  useEffect(() => {
    if (isOpen) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center bg-black/50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-offwhite w-[90%] sm:w-full max-w-md sm:max-w-2xl mt-20 p-4 sm:p-6 rounded-lg shadow-lg relative
          transform transition-transform duration-300
          ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:text-gold transition-colors"
          aria-label={t("close")}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
        </button>

        {/* Title */}
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-center mb-4 sm:mb-6 text-black">
          {t("searchProduct")}
        </h2>

        {/* Search input */}
        <div className="flex items-center rounded-md overflow-hidden focus-within:border-black shadow-sm border border-gray-300">
          <Search className="m-2 sm:m-3 text-gray-500 w-4 h-4 sm:w-6 sm:h-6" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className=" w-full rounded-md border-0 bg-offwhite px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* CTA */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg sm:rounded-xl bg-black text-offwhite font-medium text-sm sm:text-base hover:bg-gold hover:text-black transition-colors w-full sm:w-auto"
          >
            {t("search")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
