import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
export async function GET() { try { const { supabase,user } = await requireUser(); const { data,error } = await supabase.from('drafts').select('id,title,language,content,created_at,updated_at').eq('user_id',user.id).order('created_at',{ascending:false}); if(error) throw error; return NextResponse.json({drafts:data}); } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:'请先登录'},{status:401}); } }
