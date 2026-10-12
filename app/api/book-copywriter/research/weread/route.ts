import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryWeRead, WeReadError } from '@/lib/weread';

export async function POST(request: Request) {
  try {
    await requireUser();
    const raw = await request.json();
    const title = typeof raw.title === 'string' ? raw.title.slice(0, 200) : '';
    const author = typeof raw.author === 'string' ? raw.author.slice(0, 200) : '';
    const bookId = typeof raw.book_id === 'string' ? raw.book_id.slice(0, 100) : '';
    const materials = await queryWeRead(title, author, bookId);
    return NextResponse.json({ materials });
  } catch (error) {
    if (error instanceof WeReadError && error.candidates.length) return NextResponse.json({ error: error.message, candidates: error.candidates }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : '微信读书资料查询失败' }, { status: 400 });
  }
}
