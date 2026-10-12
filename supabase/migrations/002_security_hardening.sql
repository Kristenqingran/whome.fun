-- Security hardening for the book-copywriter workbench.
-- This migration intentionally replaces the callable RPC signatures from 001.

create table if not exists public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id text not null,
  status text not null check (status in ('processing','completed','failed','uncertain','resolved')),
  reservation_id uuid references public.quota_reservations(id),
  result jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, request_id)
);

create table if not exists public.generation_resolution_audit (
  id uuid primary key default gen_random_uuid(),
  generation_request_id uuid not null unique references public.generation_requests(id),
  request_id text not null,
  admin_id uuid not null references public.profiles(id),
  action text not null check (action in ('release','settle')),
  actual_cost_cents integer not null check (actual_cost_cents >= 0),
  note text,
  created_at timestamptz not null default now()
);

alter table public.drafts add column if not exists generation_request_id uuid references public.generation_requests(id);
create unique index if not exists drafts_generation_request_language_key
  on public.drafts(generation_request_id, language)
  where generation_request_id is not null;

alter table public.generation_requests enable row level security;
drop policy if exists "users read own generation requests" on public.generation_requests;
create policy "users read own generation requests" on public.generation_requests
  for select using (auth.uid() = user_id);

-- Remove the old callable signatures before creating the auth-bound versions.
revoke all on function public.approve_application(uuid,uuid) from public, anon, authenticated;
revoke all on function public.reserve_quota(uuid,text,integer) from public, anon, authenticated;
revoke all on function public.settle_quota(uuid,text,text,text,integer,integer,integer) from public, anon, authenticated;
revoke all on function public.refund_reservation(uuid,text,text,text) from public, anon, authenticated;
drop function if exists public.approve_application(uuid,uuid);
drop function if exists public.reserve_quota(uuid,text,integer);
drop function if exists public.settle_quota(uuid,text,text,text,integer,integer,integer);
drop function if exists public.refund_reservation(uuid,text,text,text);

create or replace function public.approve_application(p_application_id uuid)
returns public.entitlements
language plpgsql security definer set search_path = public, auth
as $$
declare
  result public.entitlements;
  target_user uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  ) then
    raise exception 'not admin';
  end if;

  select user_id into target_user
  from public.access_applications
  where id = p_application_id and status = 'pending'
  for update;
  if target_user is null then raise exception 'application unavailable'; end if;
  if not exists (
    select 1 from auth.users
    where id = target_user and email_confirmed_at is not null
  ) then
    raise exception 'email not verified';
  end if;

  update public.access_applications
  set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_application_id;

  insert into public.entitlements(user_id, application_id, approved_at, expires_at,
    quota_total_cents, quota_remaining_cents, approved_by)
  values (target_user, p_application_id, now(), now() + interval '30 days',
    600, 600, auth.uid())
  returning * into result;
  return result;
end;
$$;

create or replace function public.reject_application(p_application_id uuid, p_note text default null)
returns void
language plpgsql security definer set search_path = public, auth
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  ) then raise exception 'not admin'; end if;
  update public.access_applications
  set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), review_note = left(p_note, 1000)
  where id = p_application_id and status = 'pending';
  if not found then raise exception 'application unavailable'; end if;
end;
$$;

create or replace function public.reserve_quota(p_request_id text, p_amount integer)
returns jsonb
language plpgsql security definer set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  req public.generation_requests;
  e public.entitlements;
  reservation public.quota_reservations;
begin
  if current_user_id is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from auth.users where id = current_user_id and email_confirmed_at is not null)
     or not exists (select 1 from public.profiles where id = current_user_id and status = 'active') then
    raise exception 'account not eligible';
  end if;
  if p_request_id is null or length(p_request_id) = 0 or length(p_request_id) > 100 then raise exception 'invalid request id'; end if;
  if p_amount <= 0 or p_amount > 600 then raise exception 'invalid reservation'; end if;

  insert into public.generation_requests(user_id, request_id, status)
  values (current_user_id, p_request_id, 'processing')
  on conflict (user_id, request_id) do nothing;
  select * into req from public.generation_requests
  where user_id = current_user_id and request_id = p_request_id for update;
  if req.status = 'completed' then return jsonb_build_object('status','completed','result',req.result); end if;
  if req.status <> 'processing' then return jsonb_build_object('status',req.status); end if;
  if req.reservation_id is not null then return jsonb_build_object('status','processing'); end if;

  update public.entitlements
  set quota_remaining_cents = quota_remaining_cents - p_amount
  where user_id = current_user_id and status = 'active' and expires_at > now()
    and quota_remaining_cents >= p_amount
  returning * into e;
  if not found then raise exception 'quota unavailable'; end if;

  insert into public.quota_reservations(user_id, entitlement_id, request_id, reserved_cents, expires_at)
  values(current_user_id, e.id, p_request_id, p_amount, now() + interval '10 minutes')
  returning * into reservation;
  update public.generation_requests set reservation_id = reservation.id, updated_at = now() where id = req.id;
  return jsonb_build_object('status','reserved','reservation_id',reservation.id);
end;
$$;

create or replace function public.finalize_generation(
  p_request_id text, p_provider text, p_model text, p_input_tokens integer,
  p_output_tokens integer, p_cost_cents integer, p_result jsonb
)
returns jsonb
language plpgsql security definer set search_path = public, auth
as $$
declare
  req public.generation_requests;
  r public.quota_reservations;
  actual integer := greatest(0, p_cost_cents);
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null)
     or not exists (select 1 from public.profiles where id = auth.uid() and status = 'active') then
    raise exception 'account not eligible';
  end if;
  select * into req from public.generation_requests
  where user_id = auth.uid() and request_id = p_request_id for update;
  if not found then raise exception 'generation request unavailable'; end if;
  if req.status = 'completed' then return req.result; end if;
  if req.status <> 'processing' or req.reservation_id is null then raise exception 'generation request unavailable'; end if;
  select * into r from public.quota_reservations where id = req.reservation_id for update;
  if r.status <> 'reserved' or r.expires_at <= now() then raise exception 'reservation expired'; end if;
  if actual > r.reserved_cents then actual := r.reserved_cents; end if;

  insert into public.drafts(user_id, generation_request_id, title, language, content)
  values
    (auth.uid(), req.id, p_result #>> '{drafts,zh,title}', 'zh', p_result #> '{drafts,zh}'),
    (auth.uid(), req.id, p_result #>> '{drafts,en,title}', 'en', p_result #> '{drafts,en}');
  update public.entitlements
  set quota_used_cents = quota_used_cents + actual,
      quota_remaining_cents = quota_remaining_cents + (r.reserved_cents - actual)
  where id = r.entitlement_id;
  update public.quota_reservations set status = 'settled', settled_cents = actual where id = r.id;
  insert into public.usage_ledger(user_id, entitlement_id, request_id, provider, model,
    input_tokens, output_tokens, total_tokens, estimated_cost_cents, status)
  values(auth.uid(), r.entitlement_id, p_request_id, p_provider, p_model,
    p_input_tokens, p_output_tokens, coalesce(p_input_tokens,0)+coalesce(p_output_tokens,0), actual, 'completed');
  update public.generation_requests set status = 'completed', result = p_result, updated_at = now() where id = req.id;
  return p_result;
end;
$$;

create or replace function public.refund_generation(p_request_id text, p_provider text default 'deepseek', p_model text default 'unknown')
returns void
language plpgsql security definer set search_path = public, auth
as $$
declare
  req public.generation_requests;
  r public.quota_reservations;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into req from public.generation_requests where user_id = auth.uid() and request_id = p_request_id for update;
  if not found or req.status <> 'processing' or req.reservation_id is null then return; end if;
  select * into r from public.quota_reservations where id = req.reservation_id for update;
  if r.status <> 'reserved' then return; end if;
  update public.entitlements set quota_remaining_cents = quota_remaining_cents + r.reserved_cents where id = r.entitlement_id;
  update public.quota_reservations set status = 'refunded' where id = r.id;
  insert into public.usage_ledger(user_id, entitlement_id, request_id, provider, model, estimated_cost_cents, status)
  values(auth.uid(), r.entitlement_id, p_request_id, p_provider, p_model, 0, 'failed');
  update public.generation_requests set status = 'failed', error_code = 'model_or_finalize_failed', updated_at = now() where id = req.id;
end;
$$;

-- Only a trusted server-side scheduler may mark expired work uncertain.
create or replace function public.recover_expired_reservations()
returns integer
language plpgsql security definer set search_path = public
as $$
declare recovered integer := 0;
begin
  update public.generation_requests set status = 'uncertain', error_code = 'reservation_expired', updated_at = now()
  where status = 'processing' and reservation_id in (select id from public.quota_reservations where status = 'reserved' and expires_at <= now());
  get diagnostics recovered = row_count;
  return recovered;
end;
$$;

-- An administrator must explicitly resolve an uncertain request. The reservation
-- remains held until this function records the decision and its audit row.
create or replace function public.resolve_uncertain_generation(
  p_request_id text, p_action text, p_actual_cost_cents integer default 0, p_note text default null
)
returns jsonb
language plpgsql security definer set search_path = public, auth
as $$
declare
  req public.generation_requests;
  r public.quota_reservations;
  actual integer := greatest(0, p_actual_cost_cents);
  audit_id uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active'
  ) then raise exception 'not admin'; end if;
  if p_action not in ('release','settle') then raise exception 'invalid resolution'; end if;
  if p_action = 'release' and actual <> 0 then raise exception 'release must have zero cost'; end if;
  select * into req from public.generation_requests
  where request_id = p_request_id and status = 'uncertain' for update;
  if not found then raise exception 'uncertain request unavailable'; end if;
  select * into r from public.quota_reservations where id = req.reservation_id for update;
  if r.status <> 'reserved' then raise exception 'reservation unavailable'; end if;
  if actual > r.reserved_cents then raise exception 'actual cost exceeds reservation'; end if;

  insert into public.generation_resolution_audit(generation_request_id, request_id, admin_id, action, actual_cost_cents, note)
  values(req.id, req.request_id, auth.uid(), p_action, actual, left(p_note, 1000))
  returning id into audit_id;
  update public.entitlements
  set quota_used_cents = quota_used_cents + actual,
      quota_remaining_cents = quota_remaining_cents + (r.reserved_cents - actual)
  where id = r.entitlement_id;
  if actual = 0 then
    update public.quota_reservations set status = 'refunded', settled_cents = 0 where id = r.id;
    insert into public.usage_ledger(user_id, entitlement_id, request_id, provider, model, estimated_cost_cents, status)
    values(r.user_id, r.entitlement_id, r.request_id, 'deepseek', 'unknown', 0, 'failed');
  else
    update public.quota_reservations set status = 'settled', settled_cents = actual where id = r.id;
    insert into public.usage_ledger(user_id, entitlement_id, request_id, provider, model, estimated_cost_cents, status)
    values(r.user_id, r.entitlement_id, r.request_id, 'deepseek', 'unknown', actual, 'completed');
  end if;
  update public.generation_requests set status = 'resolved', error_code = 'manually_resolved', updated_at = now() where id = req.id;
  return jsonb_build_object('status','resolved','audit_id',audit_id,'actual_cost_cents',actual);
end;
$$;

revoke all on function public.approve_application(uuid) from public, anon;
revoke all on function public.reject_application(uuid,text) from public, anon;
revoke all on function public.reserve_quota(text,integer) from public, anon;
revoke all on function public.finalize_generation(text,text,text,integer,integer,integer,jsonb) from public, anon;
revoke all on function public.refund_generation(text,text,text) from public, anon;
revoke all on function public.recover_expired_reservations() from public, anon, authenticated;
revoke all on function public.resolve_uncertain_generation(text,text,integer,text) from public, anon;
grant execute on function public.approve_application(uuid) to authenticated;
grant execute on function public.reject_application(uuid,text) to authenticated;
grant execute on function public.reserve_quota(text,integer) to authenticated;
grant execute on function public.finalize_generation(text,text,text,integer,integer,integer,jsonb) to authenticated;
grant execute on function public.refund_generation(text,text,text) to authenticated;
grant execute on function public.recover_expired_reservations() to service_role;
grant execute on function public.resolve_uncertain_generation(text,text,integer,text) to authenticated;
