begin;

create extension if not exists pgcrypto;

create table if not exists public.client_sites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    site_name text not null,
    site_key text not null,
    public_url text,
    admin_url text,
    status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, site_key)
);

create table if not exists public.client_site_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    site_id uuid not null references public.client_sites(id) on delete cascade,
    request_type text not null check (request_type in ('update', 'bug')),
    subject text not null check (char_length(subject) between 1 and 120),
    details text not null check (char_length(details) between 1 and 3000),
    status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'in_progress', 'completed', 'closed')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.client_sites enable row level security;
alter table public.client_site_requests enable row level security;

drop policy if exists "Clients view only their sites" on public.client_sites;
create policy "Clients view only their sites"
on public.client_sites for select
to authenticated
using ((select auth.uid()) = user_id);

-- Sites are assigned by trusted server/admin code only. There is intentionally
-- no client INSERT, UPDATE, or DELETE policy on client_sites.

drop policy if exists "Clients view only their requests" on public.client_site_requests;
create policy "Clients view only their requests"
on public.client_site_requests for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Clients submit requests for their own sites" on public.client_site_requests;
create policy "Clients submit requests for their own sites"
on public.client_site_requests for insert
to authenticated
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.client_sites s
        where s.id = site_id
          and s.user_id = (select auth.uid())
    )
);

grant select on public.client_sites to authenticated;
grant select, insert on public.client_site_requests to authenticated;

create index if not exists client_sites_user_id_idx on public.client_sites(user_id);
create index if not exists client_site_requests_user_id_idx on public.client_site_requests(user_id, created_at desc);
create index if not exists client_site_requests_site_id_idx on public.client_site_requests(site_id);

commit;
