import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { requestId } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action === 'settle' ? 'settle' : body.action === 'release' ? 'release' : null;
    const actualCost = Number.isInteger(body.actual_cost_cents) ? body.actual_cost_cents : 0;
    if (!action || actualCost < 0) return NextResponse.json({ error: '核销参数无效' }, { status: 400 });
    const { data, error } = await supabase.rpc('resolve_uncertain_generation', {
      p_request_id: requestId,
      p_action: action,
      p_actual_cost_cents: actualCost,
      p_note: typeof body.note === 'string' ? body.note.slice(0, 1000) : null,
    });
    if (error) throw error;
    return NextResponse.json({ resolution: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '核销失败' }, { status: 400 });
  }
}
