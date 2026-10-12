import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase';
import LogoutButton from './logout-button';

export default async function Header({ lang }: { lang: string }) {
  let user: { id: string; email_confirmed_at?: string | null } | null = null;
  let isAdmin = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await getSupabaseServer();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user?.email_confirmed_at) {
      const { data: profile } = await supabase.from('profiles').select('role,status').eq('id', user.id).maybeSingle();
      isAdmin = profile?.role === 'admin' && profile.status !== 'suspended';
    }
  }

  return <header className="site-header"><div className="shell site-header-inner">
    <Link href={`/${lang}`} className="site-brand"><strong>Whome Copywriter</strong></Link>
    <nav className="site-nav" aria-label="主导航">
      {!user ? <><Link href={`/${lang}/login`}>登录</Link><Link href={`/${lang}/register`}>注册</Link></> : <>
        <Link href={`/${lang}/book-copywriter`}>工作台</Link>
        <Link href={`/${lang}/drafts`}>我的稿件</Link>
        <Link href={`/${lang}/account`}>账户</Link>
        {isAdmin && <Link href={`/${lang}/admin`}>管理后台</Link>}
        <LogoutButton />
      </>}
    </nav>
  </div></header>;
}
