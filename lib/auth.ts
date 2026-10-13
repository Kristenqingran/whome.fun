import { getSupabaseServer } from './supabase';
export async function requireUser() { const supabase = await getSupabaseServer(); const { data, error } = await supabase.auth.getUser(); if (error || !data.user || !data.user.email_confirmed_at) throw new Error('请先完成邮箱验证并登录'); return { supabase, user: data.user }; }
export async function requireAdmin() { const result = await requireUser(); const { data } = await result.supabase.from('profiles').select('role,status').eq('id', result.user.id).single(); if (data?.role !== 'admin' || data.status === 'suspended') throw new Error('无管理员权限'); return result; }

export function safeLoginReturnPath(next: string | null, lang: string) {
  const fallbackPrefix = `/${lang}/`;
  if (!next || !next.startsWith(fallbackPrefix) || next.startsWith('//') || next.includes('\\') || next.includes('%')) return null;
  const pathname = next.split(/[?#]/, 1)[0];
  if (pathname === `/${lang}/login` || pathname === `/${lang}/register` || pathname === `/${lang}/auth/callback` || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return null;
  return next;
}
