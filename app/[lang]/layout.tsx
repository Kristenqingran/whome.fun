import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Locale } from '@/lib/types';
import { getDictionary } from '@/lib/i18n';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }];
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <div className="min-h-full flex flex-col">
      <Header lang={lang as Locale} dictionary={dictionary} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang as Locale} dictionary={dictionary} />
    </div>
  );
}
