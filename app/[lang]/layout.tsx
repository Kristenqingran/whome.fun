import Header from './header';

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <><Header lang={lang} /><main>{children}</main></>;
}
