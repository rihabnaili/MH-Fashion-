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
      <Menu.Button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-sm text-black bg-white hover:border-black transition-colors">
        <span className="text-sm">{flags[lang]}</span>
        <ChevronDown className={`w-3 h-3 ${lang === 'ar' ? 'rotate-180' : ''}`} />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-200 z-50">
        {languages.map(({ code, label }) => (
          <Menu.Item key={code}>
            {({ active }) => (
              <button
                onClick={() => setLang(code)}
                className={`${
                  active ? 'bg-gray-100 text-black' : 'text-black'
                } flex items-center w-full px-4 py-2 text-sm transition-colors ${
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