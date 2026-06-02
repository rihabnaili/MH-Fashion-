'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

type Sponsor = {
  _id: string;
  name: string;
  logoDataUri: string;
  websiteUrl?: string;
};

export default function SponsorsSection() {
  const { lang, isRTL } = useLanguage();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/sponsors')
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data.success) {
          setSponsors(data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching sponsors:', error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && sponsors.length === 0) {
    return null;
  }

  const copy =
    lang === 'ar'
      ? {
          eyebrow: 'شركاؤنا',
          title: 'العلامات التي تدعم MH Fashion',
        }
      : {
          eyebrow: 'Sponsoring',
          title: 'Ils accompagnent MH Fashion',
        };

  return (
    <section className="bg-white py-14 font-montserrat sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="mb-3 text-xs uppercase tracking-[0.38em] text-[#8b8b8b]">
            {copy.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-[0.06em] text-[#111111] sm:text-4xl">
            {copy.title}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-lg border border-[#dddddd] bg-[#f5f5f5]"
                />
              ))
            : sponsors.map((sponsor) => {
                const content = (
                  <div className="flex h-28 items-center justify-center rounded-lg border border-[#dddddd] bg-[#fafafa] p-5 transition-colors hover:border-black hover:bg-white">
                    <img
                      src={sponsor.logoDataUri}
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                );

                if (!sponsor.websiteUrl) {
                  return <div key={sponsor._id}>{content}</div>;
                }

                return (
                  <a
                    key={sponsor._id}
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={sponsor.name}
                  >
                    {content}
                  </a>
                );
              })}
        </div>
      </div>
    </section>
  );
}
