-- Keep self-profile reads independent from the admin lookup function.
-- This avoids evaluating a same-table role check for ordinary self reads.
drop policy if exists "users read own profile" on public.profiles;

create policy "users read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "admins read profiles" on public.profiles;

create policy "admins read profiles"
  on public.profiles
  for select
  using (public.is_admin(auth.uid()));
