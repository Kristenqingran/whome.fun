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
});
