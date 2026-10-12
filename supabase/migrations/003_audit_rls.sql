-- Keep manual resolution audit records inaccessible through direct table access.
-- The SECURITY DEFINER resolution function remains the only write path.
alter table public.generation_resolution_audit enable row level security;
