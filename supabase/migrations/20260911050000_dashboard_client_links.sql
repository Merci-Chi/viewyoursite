begin;

-- Dashboard access is granted only through immutable auth app_metadata.
create or replace function public.is_dashboard_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'owner');
$$;

revoke all on function public.is_dashboard_admin() from public;
grant execute on function public.is_dashboard_admin() to authenticated;

alter table public.client_site_requests
  drop constraint if exists client_site_requests_request_type_check;
alter table public.client_site_requests
  add constraint client_site_requests_request_type_check
  check (request_type in ('update', 'bug', 'domain'));

drop policy if exists "Dashboard admins manage client sites" on public.client_sites;
create policy "Dashboard admins manage client sites"
on public.client_sites
for all
to authenticated
using ((select public.is_dashboard_admin()))
with check ((select public.is_dashboard_admin()));

drop policy if exists "Dashboard admins manage client requests" on public.client_site_requests;
create policy "Dashboard admins manage client requests"
on public.client_site_requests
for all
to authenticated
using ((select public.is_dashboard_admin()))
with check ((select public.is_dashboard_admin()));

grant insert, update, delete on public.client_sites to authenticated;
grant update, delete on public.client_site_requests to authenticated;

commit;
