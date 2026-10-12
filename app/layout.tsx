import './globals.css';

export const metadata = { title: 'Whome Copywriter', description: '邀请制图书口播文案工作台' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
