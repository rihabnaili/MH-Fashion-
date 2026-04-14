"use client";

import React from "react";
import { ShoppingCart, X } from "lucide-react";
import Logo from "../ui/Logo";
import { useTranslations } from "@/app/hooks/useTranslations";

const Sidebar = ({ isOpen, onClose }) => {
  const t = useTranslations();

  const menuItems = [
    t("ensembles"),
    t("tShirtsPolos"),
    t("shortsPantalons"),
    t("chemises"),
    t("packsOffresSpeciales"),
    t("promos"),
    t("nouveautes"),
    t("allProducts"),
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-[#f6f6f6] font-text shadow-xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Logo />
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        <nav className="py-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              onClick={onClose}
              className="block border-b border-gray-100 px-6 py-4 text-sm text-black transition-colors hover:bg-[#ededed] hover:text-black"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
