import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requestSchema } from '@/lib/copywriter';
import { generateCopy } from '@/lib/model';
export async function POST(request: Request) { try { const { supabase, user } = await requireUser(); const { data: profile } = await supabase.from('profiles').select('status').eq('id',user.id).single(); if (profile?.status !== 'active') return NextResponse.json({ error:'账号尚未通过管理员审核' },{status:403}); const parsed = requestSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({error:'输入内容不符合要求'},{status:400}); return NextResponse.json(await generateCopy(parsed.data)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '重新生成失败' }, { status: 400 }); } }
