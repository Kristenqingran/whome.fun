import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('legacy quiz routes are not present', () => {
  assert.equal(fs.existsSync('app/[lang]/tests'), false);
  assert.equal(fs.existsSync('content/tests'), false);
});

test('server configuration keeps provider key out of client code', () => {
  const source = fs.readFileSync('lib/model.ts', 'utf8');
  assert.match(source, /process\.env\.DEEPSEEK_API_KEY/);
  assert.match(fs.readFileSync('.gitignore', 'utf8'), /\.env\*/);
});

test('fixed entitlement values are present in the database migration', () => {
  const migration = fs.readFileSync('supabase/migrations/001_workbench.sql', 'utf8');
  assert.match(migration, /quota_total_cents integer not null default 600/);
  assert.match(migration, /interval '30 days'/);
  assert.match(migration, /settle_quota/);
  assert.match(migration, /refund_reservation/);
  assert.match(migration, /enable row level security/);
});

test('public model-test and payment routes are absent', () => {
  assert.equal(fs.existsSync('app/api/book-copywriter/model-test'), false);
  assert.equal(fs.existsSync('app/api/payment'), false);
  assert.equal(fs.existsSync('app/api/orders'), false);
});

test('security hardening migration binds privileged functions to auth.uid', () => {
  const migration = fs.readFileSync('supabase/migrations/002_security_hardening.sql', 'utf8');
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /revoke all on function public\.approve_application/);
  assert.match(migration, /revoke all on function public\.reserve_quota/);
  assert.match(migration, /grant execute on function public\.reserve_quota\(text,integer\) to authenticated/);
  assert.match(migration, /email_confirmed_at/);
  assert.match(migration, /generation_requests/);
  assert.match(migration, /status.*uncertain/);
  assert.match(migration, /for update/);
  assert.match(migration, /create or replace function public\.reject_application/);
  assert.match(migration, /reviewed_by = auth\.uid\(\)/);
  assert.match(migration, /on conflict \(user_id, request_id\) do nothing/);
  assert.match(migration, /recover_expired_reservations/);
  assert.match(migration, /generation_resolution_audit/);
  assert.match(migration, /resolve_uncertain_generation/);
  assert.match(migration, /status = 'uncertain'/);
  assert.match(migration, /status = 'resolved'/);
  assert.match(migration, /actual cost exceeds reservation/);
  assert.doesNotMatch(migration, /recover_expired_reservations[\s\S]{0,1800}quota_remaining_cents = quota_remaining_cents \+/);
  assert.doesNotMatch(migration, /grant execute on function public\.(approve_application|recover_expired_reservations).*public/);
});

test('uncertain resolution is admin-only and cannot be bypassed by a new request', () => {
  const migration = fs.readFileSync('supabase/migrations/002_security_hardening.sql', 'utf8');
  const route = fs.readFileSync('app/api/admin/generations/[requestId]/resolve/route.ts', 'utf8');
  assert.match(route, /requireAdmin/);
  assert.match(route, /resolve_uncertain_generation/);
  assert.match(migration, /unique \(user_id, request_id\)/);
  assert.match(migration, /if req\.status <> 'processing' then return jsonb_build_object\('status',req\.status\)/);
});

test('resolution audit is protected by RLS', () => {
  const migration = fs.readFileSync('supabase/migrations/003_audit_rls.sql', 'utf8');
  assert.match(migration, /generation_resolution_audit enable row level security/);
});

test('preview auth uses the current origin and exchanges email callback codes server-side', () => {
  const register = fs.readFileSync('app/[lang]/register/page.tsx', 'utf8');
  const callback = fs.readFileSync('app/[lang]/auth/callback/route.ts', 'utf8');
  assert.match(register, /window\.location\.origin/);
  assert.match(register, /emailRedirectTo/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.doesNotMatch(callback, /service_role|DEEPSEEK_API_KEY/);
});

test('model mock is opt-in and remains server-side', () => {
  const source = fs.readFileSync('lib/model.ts', 'utf8');
  assert.match(source, /MODEL_PROVIDER === 'mock'/);
  assert.match(source, /DEEPSEEK_API_KEY/);
  assert.doesNotMatch(fs.readFileSync('app/[lang]/book-copywriter/page.tsx', 'utf8'), /MODEL_PROVIDER|DEEPSEEK_API_KEY/);
});

test('generation route never accepts or forwards a caller supplied user id', () => {
  const source = fs.readFileSync('app/api/book-copywriter/generate/route.ts', 'utf8');
  assert.doesNotMatch(source, /p_user_id/);
  assert.match(source, /reserve_quota/);
  assert.match(source, /finalize_generation/);
  assert.match(source, /refund_generation/);
});

test('header derives navigation from server session and role', () => {
  const header = fs.readFileSync('app/[lang]/header.tsx', 'utf8');
  assert.match(header, /getSupabaseServer/);
  assert.match(header, /profile\?\.role === 'admin'/);
  assert.match(header, /!user \? /);
  assert.match(header, /管理后台/);
  assert.match(fs.readFileSync('app/[lang]/logout-button.tsx', 'utf8'), /退出/);
  assert.doesNotMatch(fs.readFileSync('app/[lang]/layout.tsx', 'utf8'), /管理/);
});

test('admin page performs server-side authorization before rendering client UI', () => {
  const page = fs.readFileSync('app/[lang]/admin/page.tsx', 'utf8');
  assert.match(page, /requireAdmin/);
  assert.match(page, /redirect/);
  assert.match(page, /AdminClient/);
});

test('drafts page redirects anonymous users and supports opening and copying drafts', () => {
  const page = fs.readFileSync('app/[lang]/drafts/page.tsx', 'utf8');
  assert.match(page, /r\.status===401/);
  assert.match(page, /\/login\?next=/);
  assert.match(page, /<details/);
  assert.match(page, /navigator\.clipboard\.writeText/);
});

test('draft API scopes reads to the authenticated user', () => {
  const route = fs.readFileSync('app/api/account/drafts/route.ts', 'utf8');
  assert.match(route, /requireUser/);
  assert.match(route, /eq\('user_id',user\.id\)/);
});

test('WeRead integration keeps the server credential server-side and requires explicit candidate selection', () => {
  const source = fs.readFileSync('lib/weread.ts', 'utf8');
  const route = fs.readFileSync('app/api/book-copywriter/research/weread/route.ts', 'utf8');
  const client = fs.readFileSync('app/[lang]/book-copywriter/workbench-client.tsx', 'utf8');
  assert.match(source, /process\.env\.WEREAD_API_KEY/);
  assert.doesNotMatch(client, /WEREAD_API_KEY|Authorization/);
  assert.match(source, /找到多本同名书/);
  assert.match(route, /requireUser/);
  assert.match(client, /展开查看微信读书资料/);
  assert.match(client, /book_id/);
});

test('generation passes confirmed WeRead materials through the existing protected route', () => {
  const client = fs.readFileSync('app/[lang]/book-copywriter/workbench-client.tsx', 'utf8');
  const schema = fs.readFileSync('lib/copywriter.ts', 'utf8');
  const route = fs.readFileSync('app/api/book-copywriter/generate/route.ts', 'utf8');
  assert.match(client, /weread_materials:materials/);
  assert.match(schema, /weread_materials/);
  assert.match(schema, /读者评论.*观点来源/);
  assert.match(route, /reserve_quota/);
  assert.match(route, /finalize_generation/);
});
