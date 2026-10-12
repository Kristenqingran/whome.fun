import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const { lang } = await params;
  if (code) {
    const supabase = await getSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(`/${lang}/login?verified=1`, url.origin));
}
