import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
export async function GET() { try { const { supabase } = await requireAdmin(); const { data, error } = await supabase.from('access_applications').select('id,user_id,status,submitted_at,profiles(email)').order('submitted_at',{ascending:false}); if (error) throw error; return NextResponse.json({ applications: data }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '无权限' }, { status: 403 }); } }
