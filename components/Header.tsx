'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Locale } from '@/lib/types';

interface HeaderProps {
  lang: Locale;
  dictionary: {
    nav: {
      trending: string;
      personality: string;
      career: string;
      love: string;
      fun: string;
    };
  };
}

export function Header({ lang, dictionary }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${lang}`, label: dictionary.nav.trending },
    { href: `/${lang}/categories/personality`, label: dictionary.nav.personality },
    { href: `/${lang}/categories/career`, label: dictionary.nav.career },
    { href: `/${lang}/categories/love`, label: dictionary.nav.love },
    { href: `/${lang}/categories/fun`, label: dictionary.nav.fun },
  ];

  const isActive = (href: string) => {
    if (href === `/${lang}`) {
      return pathname === `/${lang}` || pathname === `/${lang}/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="site-container">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${lang}`} className="text-2xl font-bold text-primary">
            Whome
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={lang === 'en' ? '/zh' : '/en'}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-slate-100 transition-colors"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-slate-100 overflow-x-auto">
        <nav className="flex px-4 py-2 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
