import Link from 'next/link';
import { Locale } from '@/lib/types';

interface FooterProps {
  lang: Locale;
  dictionary: {
    footer: {
      copyright: string;
    };
  };
}

export function Footer({ lang, dictionary }: FooterProps) {
  return (
    <footer className="w-full bg-white border-t border-slate-100 mt-auto">
      <div className="site-container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Link href={`/${lang}`} className="text-lg font-bold text-primary">
            Whome
          </Link>
          <p className="text-[13px] text-text-secondary">
            © {new Date().getFullYear()} {dictionary.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
