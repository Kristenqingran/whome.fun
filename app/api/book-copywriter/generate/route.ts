import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireUser } from '@/lib/auth';
import { requestSchema } from '@/lib/copywriter';
import { estimateCostCents, generateCopy } from '@/lib/model';

export async function POST(request: Request) {
  let requestId = randomUUID();
  try {
    const { supabase, user } = await requireUser();
    const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single();
    if (profile?.status !== 'active') return NextResponse.json({ error: '账号尚未通过管理员审核' }, { status: 403 });
    const raw = await request.json();
    if (typeof raw.request_id === 'string' && raw.request_id.length < 100) requestId = raw.request_id;
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: '输入内容不符合要求' }, { status: 400 });
    const { data: reservation, error: reserveError } = await supabase.rpc('reserve_quota', { p_request_id: requestId, p_amount: 50 });
    if (reserveError) return NextResponse.json({ error: '当前没有可用的模型调用额度' }, { status: 402 });
    if (reservation?.status === 'completed') return NextResponse.json({ result: reservation.result, requestId, status: 'completed' });
    if (reservation?.status === 'processing') return NextResponse.json({ error: '相同请求正在处理中，请稍后查询结果' }, { status: 202 });
    if (reservation?.status === 'failed' || reservation?.status === 'uncertain') return NextResponse.json({ error: '相同请求已结束或状态不确定，请使用新的请求编号' }, { status: 409 });
    try {
      const output = await generateCopy(parsed.data);
      const usage = output.usage as { prompt_tokens?: number; completion_tokens?: number };
      const { data: result, error: finalizeError } = await supabase.rpc('finalize_generation', {
        p_request_id: requestId,
        p_provider: 'deepseek',
        p_model: output.model,
        p_input_tokens: usage.prompt_tokens || 0,
        p_output_tokens: usage.completion_tokens || 0,
        p_cost_cents: estimateCostCents(usage),
        p_result: output.result,
      });
      if (finalizeError) throw new Error('稿件保存或额度结算失败');
      return NextResponse.json({ ...output, result, requestId });
    } catch (error) {
      await supabase.rpc('refund_generation', { p_request_id: requestId, p_provider: 'deepseek', p_model: process.env.DEEPSEEK_MODEL || 'deepseek-chat' });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '请求失败' }, { status: 400 });
  }
}
