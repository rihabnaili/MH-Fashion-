'use client';

import { Menu } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

import { useLanguage } from '@/app/context/LanguageContext';

type LanguageToggleProps = {
  align?: 'left' | 'right';
  direction?: 'up' | 'down';
  buttonClassName?: string;
  menuClassName?: string;
  wrapperClassName?: string;
};

const flags: Record<string, React.ReactNode> = {
  fr: <ReactCountryFlag countryCode="FR" svg style={{ width: '16px', height: '16px' }} />,
  ar: <ReactCountryFlag countryCode="TN" svg style={{ width: '16px', height: '16px' }} />,
};

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'TN' },
];

export default function LanguageToggle({
  align = 'right',
  direction = 'down',
  buttonClassName = '',
  menuClassName = '',
  wrapperClassName = '',
}: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  const alignmentClass = align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right';
  const upwardAlignmentClass = align === 'left' ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right';
  const menuPositionClass =
    direction === 'up'
      ? `${upwardAlignmentClass} bottom-full mb-2`
      : `${alignmentClass} top-full mt-2`;

  return (
    <Menu as="div" className={`relative inline-block text-left ${wrapperClassName}`}>
      <Menu.Button
        className={`flex items-center gap-2 rounded-full border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-[#111111] shadow-[0_12px_30px_-24px_rgba(0,0,0,0.18)] transition-colors hover:border-[#111111] ${buttonClassName}`}
      >
        <span className="text-sm">{flags[lang]}</span>
        <ChevronDown className={`h-3 w-3 ${lang === 'ar' ? 'rotate-180' : ''}`} />
      </Menu.Button>

      <Menu.Items
        className={`absolute z-50 w-32 overflow-hidden rounded-2xl border border-[#d9d9d9] bg-white shadow-[0_25px_60px_-35px_rgba(0,0,0,0.18)] ${menuPositionClass} ${menuClassName}`}
      >
        {languages.map(({ code, label }) => (
          <Menu.Item key={code}>
            {({ active }) => (
              <button
                onClick={() => setLang(code)}
                className={`${
                  active ? 'bg-[#f3f3f3] text-[#111111]' : 'text-[#111111]'
                } flex w-full items-center px-4 py-3 text-sm transition-colors ${
                  code === 'ar' ? 'font-arabic' : 'font-montserrat'
                }`}
              >
                <span className="mr-2 text-base">{flags[code]}</span>
                <span>{label}</span>
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
