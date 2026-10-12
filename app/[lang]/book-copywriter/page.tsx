import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase';
import WorkbenchClient from './workbench-client';

export default async function WorkbenchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <div className="shell"><section className="card"><h1>登录配置未完成</h1><p className="muted">请先在本地配置 Supabase URL 和 publishable/anon key，配置后再访问工作台。</p><p><a href={`/${lang}/register`}>注册</a> · <a href={`/${lang}/login`}>登录</a></p></section></div>;
  }
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/${lang}/login`);
  return <WorkbenchClient />;
}
