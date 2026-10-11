import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) { try { const { supabase, user } = await requireAdmin(); const { id } = await params; const { data, error } = await supabase.rpc('approve_application', { p_application_id: id, p_admin_id: user.id }); if (error) throw error; return NextResponse.json({ entitlement: data }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '批准失败' }, { status: 400 }); } }
