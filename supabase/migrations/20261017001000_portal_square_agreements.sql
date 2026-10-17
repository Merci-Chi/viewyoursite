-- Keep square.agreementid -> public.agreements for legacy checkouts.
-- Portal project agreements use their own columns and foreign keys.
begin;

alter table public.square
  add column if not exists portal_project_id uuid,
  add column if not exists portal_agreement_id uuid;

-- Portal records intentionally leave the legacy agreement column empty.
alter table public.square alter column agreementid drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.square'::regclass
      and conname = 'square_portal_project_id_fkey') then
    alter table public.square add constraint square_portal_project_id_fkey
      foreign key (portal_project_id) references public.portal_website_projects(id);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.square'::regclass
      and conname = 'square_portal_agreement_id_fkey') then
    alter table public.square add constraint square_portal_agreement_id_fkey
      foreign key (portal_agreement_id) references public.portal_project_agreements(id);
  end if;
end $$;

create index if not exists square_portal_project_user_idx
  on public.square (userid, portal_project_id)
  where portal_project_id is not null;

commit;
