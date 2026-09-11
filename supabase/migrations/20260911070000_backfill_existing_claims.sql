begin;

-- Register the earliest real claim for every previously claimed site.
insert into public.claimed_site_keys (site_key, user_id, claim_id, claimed_at)
select distinct on (site_item ->> 'path')
  site_item ->> 'path',
  claim.user_id,
  claim.id,
  claim.created_at
from public.site_claims claim
cross join lateral jsonb_array_elements(coalesce(claim.sites, '[]'::jsonb)) site_item
where coalesce(site_item ->> 'path', '') ~ '^[A-Za-z0-9_-]+$'
order by site_item ->> 'path', claim.created_at asc
on conflict (site_key) do nothing;

-- Make all registered sites visible in the correct owner's Site Management.
insert into public.client_sites (
  user_id,
  site_name,
  site_key,
  public_url,
  status,
  created_at,
  updated_at
)
select
  registry.user_id,
  coalesce(nullif(site_item ->> 'name', ''), initcap(replace(registry.site_key, '-', ' '))),
  registry.site_key,
  'https://viewyoursite.today/' || registry.site_key || '/',
  'pending',
  registry.claimed_at,
  now()
from public.claimed_site_keys registry
join public.site_claims claim
  on claim.id = registry.claim_id
cross join lateral jsonb_array_elements(coalesce(claim.sites, '[]'::jsonb)) site_item
where site_item ->> 'path' = registry.site_key
on conflict (user_id, site_key) do nothing;

commit;
