"use client";
import React from "react";
import { useTranslations } from "@/app/hooks/useTranslations";
import {
  Truck,
  Wallet,
  ShieldCheck,
  Headset,
} from "lucide-react";

const ServicesSection = () => {
  const t = useTranslations();

  const services = [
    {
      title: t("freeDelivery"),
      description: t("freeDeliveryDesc"),
      icon: <Truck className="w-6 h-6 text-black" />,
    },
    {
      title: t("paymentOnDelivery"),
      description: t("paymentOnDeliveryDesc"),
      icon: <Wallet className="w-6 h-6 text-black" />,
    },
    {
      title: t("checkBeforePay"),
      description: t("checkBeforePayDesc"),
      icon: <ShieldCheck className="w-6 h-6 text-black" />,
    },
    {
      title: t("customerSupport"),
      description: t("customerSupportDesc"),
      icon: <Headset className="w-6 h-6 text-black" />,
    },
  ];

  return (
    <section className="py-16 bg-gray-50 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {services.map((service, index) => (
            <div key={index}>
              <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                {service.icon}
              </div>
              <h3 className="font-medium mb-2 text-black">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
