-- First-party, pseudonymous conversion analytics.
-- No plate, email, phone, document number, IP, or payment credentials are stored here.
create table if not exists public.analytics_events(
  id bigint generated always as identity primary key,
  analytics_id uuid not null,
  event text not null check(event in (
    'landing_view',
    'plate_submitted',
    'preview_success',
    'preview_failed',
    'checkout_started',
    'payment_method_selected',
    'payment_proof_uploaded',
    'payment_submitted',
    'payment_approved',
    'admin_payment_approved',
    'report_started',
    'provider_failed',
    'report_ready',
    'report_partial',
    'report_viewed',
    'pdf_downloaded',
    'report_shared'
  )),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_created
  on public.analytics_events(event, created_at desc);

create index if not exists analytics_events_session_created
  on public.analytics_events(analytics_id, created_at desc);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant all on public.analytics_events to service_role;
grant select on public.analytics_events to authenticated;

drop policy if exists admin_read on public.analytics_events;
create policy admin_read on public.analytics_events
  for select to authenticated
  using ((select auth.jwt())->'app_metadata'->>'role'='admin');

create or replace function public.admin_funnel_metrics(p_days integer default 30)
returns jsonb
language sql
security invoker
set search_path=''
as $$
  with scoped as (
    select analytics_id, event
    from public.analytics_events
    where created_at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  )
  select jsonb_build_object(
    'days', greatest(1, least(p_days, 365)),
    'landing', count(distinct analytics_id) filter(where event='landing_view'),
    'plate_submitted', count(distinct analytics_id) filter(where event='plate_submitted'),
    'preview_success', count(distinct analytics_id) filter(where event='preview_success'),
    'checkout_started', count(distinct analytics_id) filter(where event='checkout_started'),
    'payment_submitted', count(distinct analytics_id) filter(where event='payment_submitted'),
    'payment_approved', count(distinct analytics_id) filter(where event='payment_approved'),
    'report_ready', count(distinct analytics_id) filter(where event in ('report_ready','report_partial')),
    'report_viewed', count(distinct analytics_id) filter(where event='report_viewed'),
    'pdf_downloaded', count(distinct analytics_id) filter(where event='pdf_downloaded')
  )
  from scoped;
$$;

revoke execute on function public.admin_funnel_metrics(integer)
  from public, anon, authenticated;
grant execute on function public.admin_funnel_metrics(integer)
  to service_role;
