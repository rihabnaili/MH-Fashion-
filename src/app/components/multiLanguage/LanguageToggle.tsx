'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { Menu } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

const flags: Record<string, React.ReactNode> = {
  fr: <ReactCountryFlag countryCode="FR" svg style={{ width: '16px', height: '16px' }} />,
  ar: <ReactCountryFlag countryCode="TN" svg style={{ width: '16px', height: '16px' }} />,
};

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'TN' },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-2 rounded-full border border-[#decbbb] bg-white/95 px-3 py-2 text-sm text-[#38261a] shadow-[0_12px_30px_-24px_rgba(70,40,20,0.55)] transition-colors hover:border-[#b88c69]">
        <span className="text-sm">{flags[lang]}</span>
        <ChevronDown className={`w-3 h-3 ${lang === 'ar' ? 'rotate-180' : ''}`} />
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-50 mt-2 w-32 origin-top-right overflow-hidden rounded-2xl border border-[#e8d8ca] bg-[#fffaf5] shadow-[0_25px_60px_-35px_rgba(65,37,18,0.45)]">
        {languages.map(({ code, label }) => (
          <Menu.Item key={code}>
            {({ active }) => (
              <button
                onClick={() => setLang(code)}
                className={`${
                  active ? 'bg-[#f4eadf] text-[#24160d]' : 'text-[#24160d]'
                } flex w-full items-center px-4 py-3 text-sm transition-colors ${
                  code === 'ar' ? 'font-arabic' : 'font-montserrat'
                }`}
              >
                <span className="text-base mr-2">{flags[code]}</span>
                <span>{label}</span>
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
