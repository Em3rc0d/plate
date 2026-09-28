-- Persist a privacy-preserving browser session id so server-side lifecycle
-- events can be tied to the same conversion funnel as landing/checkout events.
alter table public.orders
  add column if not exists analytics_id uuid;

create index if not exists orders_analytics_id
  on public.orders(analytics_id)
  where analytics_id is not null;
