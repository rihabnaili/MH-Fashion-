"use client";

import React from "react";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/context/LanguageContext";
import { Truck, Wallet, ShieldCheck, Headset } from "lucide-react";

const ServicesSection = () => {
  const t = useTranslations();
  const { lang, isRTL } = useLanguage();
  const intro =
    lang === "ar"
      ? {
          eyebrow: "معلومات عنا",
          title: "خدمة واضحة وسريعة تبني الثقة.",
          description:
            "اعادة ترتيب الجزء السفلي من الصفحة باش العميل يلقى بسرعة نقاط الطمأنة والتواصل.",
        }
      : {
          eyebrow: "Informations utiles",
          title: "Les infos utiles, sans surcharge.",
          description: "Livraison, paiement et assistance: l'essentiel, clairement presente.",
        };

  const services = [
    {
      title: t("freeDelivery"),
      description: t("freeDeliveryDesc"),
      icon: <Truck className="h-6 w-6 text-[#111111]" />,
    },
    {
      title: t("paymentOnDelivery"),
      description: t("paymentOnDeliveryDesc"),
      icon: <Wallet className="h-6 w-6 text-[#111111]" />,
    },
    {
      title: t("checkBeforePay"),
      description: t("checkBeforePayDesc"),
      icon: <ShieldCheck className="h-6 w-6 text-[#111111]" />,
    },
    {
      title: t("customerSupport"),
      description: t("customerSupportDesc"),
      icon: <Headset className="h-6 w-6 text-[#111111]" />,
    },
  ];

  return (
    <section className="bg-[#f2f2f2] py-16 sm:py-20 font-montserrat">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-10 max-w-2xl ${isRTL ? "mr-auto text-right" : "text-left"}`}>
          <p className="mb-3 text-xs uppercase tracking-[0.38em] text-[#8b8b8b]">
            {intro.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-[0.06em] text-[#111111] sm:text-4xl">
            {intro.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#5b5b5b] sm:text-base">
            {intro.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-[1.8rem] border border-[#dddddd] bg-white p-6 text-center shadow-[0_22px_60px_-45px_rgba(0,0,0,0.18)]"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f5]">
                {service.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#111111]">
                {service.title}
              </h3>
              <p className="text-sm leading-6 text-[#5f5f5f]">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
