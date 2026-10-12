const GATEWAY_URL = 'https://i.weread.qq.com/api/agent/gateway';

export type WeReadCandidate = { book_id: string; title: string; author: string };
export type WeReadMaterials = {
  provider: 'WeChat Reading Agent Gateway';
  display: { book: { title: string; author: string }; introduction: string; table_of_contents: string[]; highlights: string[]; reader_reviews: string[] };
  source: 'weread';
};
type JsonObject = Record<string, unknown>;
type SearchBook = { bookInfo?: { bookId?: string | number; title?: unknown; author?: unknown } };

export class WeReadError extends Error {
  candidates: WeReadCandidate[];
  constructor(message: string, candidates: WeReadCandidate[] = []) { super(message); this.candidates = candidates; }
}

function clean(value: string) { return value.replace(/[\s《》「」『』：:，,。.!！?？\-—_·]/g, '').toLocaleLowerCase(); }
function asText(value: unknown): string { return typeof value === 'string' ? value : ''; }
function chapterTitles(value: unknown): string[] { return Array.isArray(value) ? value.map(item => item && typeof item === 'object' ? asText((item as JsonObject).title) : '').filter(Boolean).slice(0, 30) : []; }
function highlightTexts(value: unknown): string[] { return Array.isArray(value) ? value.map(item => item && typeof item === 'object' ? asText((item as JsonObject).markText) : '').filter(Boolean).slice(0, 30) : []; }
function reviewTexts(value: unknown): string[] { return Array.isArray(value) ? value.map(item => { const review = item && typeof item === 'object' ? (item as JsonObject).review : null; const nested = review && typeof review === 'object' ? (review as JsonObject).review : null; return nested && typeof nested === 'object' ? asText((nested as JsonObject).content) : ''; }).filter(Boolean).slice(0, 30) : []; }
function candidatesFrom(books: SearchBook[]): WeReadCandidate[] { return books.slice(0, 8).map(book => ({ book_id: String(book.bookInfo?.bookId || ''), title: asText(book.bookInfo?.title), author: asText(book.bookInfo?.author) })).filter(item => item.book_id && item.title); }

export async function queryWeRead(title: string, author = '', bookId = ''): Promise<WeReadMaterials> {
  const key = process.env.WEREAD_API_KEY?.trim();
  if (!key) throw new WeReadError('微信读书资料查询暂不可用：服务端尚未配置 WEREAD_API_KEY');
  if (!title.trim()) throw new WeReadError('请先填写书名');
  const call = async (apiName: string, params: Record<string, unknown>) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(GATEWAY_URL, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ api_name: apiName, ...params, skill_version: '1.0.4' }), signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('gateway');
      const text = await response.text(); if (text.length > 500_000) throw new Error('large');
      const value: unknown = JSON.parse(text); if (!value || typeof value !== 'object') throw new Error('format'); return value as JsonObject;
    } catch { throw new WeReadError('微信读书资料查询失败，请检查 Key、网络和接口权限'); } finally { clearTimeout(timer); }
  };
  const search = await call('/store/search', { keyword: title, scope: 10 });
  const groups = Array.isArray(search.results) ? search.results.filter((group): group is JsonObject => Boolean(group && typeof group === 'object')) : [];
  const books = groups.flatMap(group => Array.isArray(group.books) ? group.books.filter((book): book is SearchBook => Boolean(book && typeof book === 'object')) : []);
  let exact = books.filter(book => clean(asText(book.bookInfo?.title)) === clean(title));
  if (!exact.length) exact = books.filter(book => { const found = clean(asText(book.bookInfo?.title)); const wanted = clean(title); return found.includes(wanted) || wanted.includes(found); });
  if (author) { const byAuthor = exact.filter(book => asText(book.bookInfo?.author).toLocaleLowerCase().includes(author.toLocaleLowerCase())); exact = byAuthor.length ? byAuthor : exact; }
  if (bookId) exact = books.filter(book => String(book.bookInfo?.bookId) === bookId);
  const candidates = candidatesFrom(exact);
  if (!candidates.length) throw new WeReadError(`微信读书未找到匹配书籍：${title}`, candidatesFrom(books));
  if (!author && !bookId && candidates.length > 1) throw new WeReadError('找到多本同名书，请先选择作者后继续', candidates);
  const selected = candidates[0].book_id;
  const [info, chapters, highlights, reviews] = await Promise.all([
    call('/book/info', { bookId: selected }), call('/book/chapterinfo', { bookId: selected }),
    call('/book/bestbookmarks', { bookId: selected, chapterUid: 0, synckey: 0 }), call('/review/list', { bookId: selected, reviewListType: 0, count: 20, maxIdx: 0, synckey: 0 }),
  ]);
  const chapterData = chapters.chapters;
  const highlightData = highlights.items;
  const reviewData = reviews.reviews;
  return { provider: 'WeChat Reading Agent Gateway', source: 'weread', display: { book: { title: asText(info.title) || candidates[0].title, author: asText(info.author) || candidates[0].author }, introduction: asText(info.intro || info.description), table_of_contents: chapterTitles(chapterData), highlights: highlightTexts(highlightData), reader_reviews: reviewTexts(reviewData) } };
}
