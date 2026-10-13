import { NextResponse } from 'next/server';
import { requireUser, safeLoginReturnPath } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'zh';
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(lang)) return NextResponse.json({ error: '无效语言' }, { status: 400 });
  try {
    const { supabase, user } = await requireUser();
    const { data: profile, error } = await supabase.from('profiles').select('role,status').eq('id', user.id).single();
    if (error || !profile || profile.status === 'suspended') throw new Error('无法确认账号权限');
    const next = safeLoginReturnPath(url.searchParams.get('next'), lang);
    const adminDestination = `/${lang}/admin`;
    const fallback = `/${lang}/book-copywriter`;
    return NextResponse.json({ destination: profile.role === 'admin' ? adminDestination : (next || fallback) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '登录状态确认失败' }, { status: 401 });
  }
}
