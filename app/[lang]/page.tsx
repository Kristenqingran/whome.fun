import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  let signedIn = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await getSupabaseServer();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  }

  return (
    <div className="home-shell">
      <section className="home-hero" aria-label="图书口播文案工作台">
        <div className="home-visual" aria-hidden="true">
          <div className="visual-glow visual-glow-one" />
          <div className="visual-glow visual-glow-two" />
          <div className="book-stage">
            <div className="book book-back" />
            <div className="book book-middle" />
            <div className="book book-front">
              <span className="book-line book-line-long" />
              <span className="book-line book-line-short" />
              <span className="book-line book-line-medium" />
            </div>
            <div className="bookmark" />
          </div>
          <div className="visual-rule visual-rule-one" />
          <div className="visual-rule visual-rule-two" />
        </div>

        <div className="home-content">
          <div className="home-content-inner">
            <div className="home-eyebrow">Whome Copywriter</div>
            <h1>图书口播文案工作台</h1>
            <p className="home-description">邀请制内测：注册并完成邮箱验证后，等待管理员批准即可使用。</p>
            <Link className="home-primary-button" href={`/${lang}/${signedIn ? 'book-copywriter' : 'register'}`}>进入工作台</Link>
            <div className="home-start">
              <h2>开始使用</h2>
              <p><Link href={`/${lang}/register`}>注册</Link><span aria-hidden="true"> · </span><Link href={`/${lang}/login`}>登录</Link></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
