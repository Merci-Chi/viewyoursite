begin;

create table if not exists public.claimed_site_keys (
  site_key text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_id uuid not null,
  claimed_at timestamptz not null default now(),
  constraint claimed_site_keys_site_key_format check (site_key ~ '^[A-Za-z0-9_-]+$')
);

alter table public.claimed_site_keys enable row level security;

drop policy if exists "Public reads claimed site keys" on public.claimed_site_keys;
create policy "Public reads claimed site keys"
on public.claimed_site_keys
for select
to anon, authenticated
using (true);

drop policy if exists "Dashboard admins manage claimed site keys" on public.claimed_site_keys;
create policy "Dashboard admins manage claimed site keys"
on public.claimed_site_keys
for all
to authenticated
using ((select public.is_dashboard_admin()))
with check ((select public.is_dashboard_admin()));

revoke all on public.claimed_site_keys from anon, authenticated;
grant select (site_key) on public.claimed_site_keys to anon, authenticated;
grant select, insert, update, delete on public.claimed_site_keys to service_role;

create index if not exists claimed_site_keys_user_id_idx on public.claimed_site_keys(user_id);
create index if not exists claimed_site_keys_claim_id_idx on public.claimed_site_keys(claim_id);

commit;
