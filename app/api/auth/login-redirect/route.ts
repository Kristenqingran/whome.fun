import { NextResponse } from 'next/server';
import { requireUser, safeLoginReturnPath } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase';

async function redirectAfterLogin(request: Request, response: NextResponse) {
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
    return NextResponse.json({ destination: profile.role === 'admin' ? adminDestination : (next || fallback) }, { headers: response.headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '登录状态确认失败' }, { status: 401, headers: response.headers });
  }
}

export async function GET(request: Request) {
  return redirectAfterLogin(request, NextResponse.next());
}

export async function POST(request: Request) {
  const response = NextResponse.next();
  try {
    const body = await request.json() as { access_token?: unknown; refresh_token?: unknown };
    if (typeof body.access_token !== 'string' || typeof body.refresh_token !== 'string') return NextResponse.json({ error: '登录会话无效' }, { status: 401 });
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
    if (error) return NextResponse.json({ error: '无法建立登录会话' }, { status: 401 });
    return redirectAfterLogin(request, response);
  } catch {
    return NextResponse.json({ error: '登录会话无效' }, { status: 401 });
  }
}
