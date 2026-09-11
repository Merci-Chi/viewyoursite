begin;

alter table public.client_sites
    add column if not exists domain_name text,
    add column if not exists domain_status text not null default 'inactive';

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'client_sites_domain_status_check'
          and conrelid = 'public.client_sites'::regclass
    ) then
        alter table public.client_sites
        add constraint client_sites_domain_status_check
        check (domain_status in ('inactive', 'pending', 'active', 'error'));
    end if;
end
$$;

commit;
