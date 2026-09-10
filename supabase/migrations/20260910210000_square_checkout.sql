create extension if not exists pgcrypto;

create table if not exists public.square_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agreement_id uuid,
  plan_key text not null,
  plan_label text not null,
  amount_cents integer not null,
  billing_cadence text not null,
  square_order_id text not null unique,
  square_payment_link_id text,
  status text not null default 'PENDING',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.hosting_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agreement_id uuid,
  checkout_session_id uuid not null unique references public.square_checkout_sessions(id),
  square_subscription_id text,
  plan_key text not null,
  plan_name text not null,
  amount_cents integer not null,
  billing_cadence text not null default 'MONTHLY',
  status text not null default 'ACTIVE',
  charged_through_date date,
  last_payment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hosting_subscriptions add column if not exists agreement_id uuid;
alter table public.hosting_subscriptions add column if not exists checkout_session_id uuid;
alter table public.hosting_subscriptions add column if not exists square_subscription_id text;
alter table public.hosting_subscriptions add column if not exists plan_key text;
alter table public.hosting_subscriptions add column if not exists plan_name text;
alter table public.hosting_subscriptions add column if not exists amount_cents integer;
alter table public.hosting_subscriptions add column if not exists billing_cadence text default 'MONTHLY';
alter table public.hosting_subscriptions add column if not exists status text default 'ACTIVE';
alter table public.hosting_subscriptions add column if not exists charged_through_date date;
alter table public.hosting_subscriptions add column if not exists last_payment_at timestamptz;
create unique index if not exists hosting_subscriptions_checkout_session_key on public.hosting_subscriptions(checkout_session_id);

create table if not exists public.site_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sites jsonb not null default '[]'::jsonb,
  hosting_selections jsonb not null default '[]'::jsonb,
  agreement_ids jsonb not null default '{}'::jsonb,
  agreement_signer text,
  agreement_business text,
  agreement_email text,
  agreement_signature text,
  agreement_signed_at timestamptz,
  agreement_plan text,
  agreement_version text,
  development_purchase_confirmed boolean not null default false,
  discount_code text,
  message text,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

alter table public.site_claims add column if not exists sites jsonb default '[]'::jsonb;
alter table public.site_claims add column if not exists hosting_selections jsonb default '[]'::jsonb;
alter table public.site_claims add column if not exists agreement_ids jsonb default '{}'::jsonb;
alter table public.site_claims add column if not exists agreement_signer text;
alter table public.site_claims add column if not exists agreement_business text;
alter table public.site_claims add column if not exists agreement_email text;
alter table public.site_claims add column if not exists agreement_signature text;
alter table public.site_claims add column if not exists agreement_signed_at timestamptz;
alter table public.site_claims add column if not exists agreement_plan text;
alter table public.site_claims add column if not exists agreement_version text;
alter table public.site_claims add column if not exists development_purchase_confirmed boolean default false;
alter table public.site_claims add column if not exists discount_code text;
alter table public.site_claims add column if not exists message text;
alter table public.site_claims add column if not exists status text default 'PENDING';

alter table public.square_checkout_sessions enable row level security;
alter table public.hosting_subscriptions enable row level security;
alter table public.site_claims enable row level security;

drop policy if exists "Users read own subscriptions" on public.hosting_subscriptions;
create policy "Users read own subscriptions" on public.hosting_subscriptions for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users read own claims" on public.site_claims;
create policy "Users read own claims" on public.site_claims for select to authenticated using (auth.uid() = user_id);
