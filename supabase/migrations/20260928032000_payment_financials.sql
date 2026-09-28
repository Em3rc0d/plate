-- Track actual Mercado Pago deductions from provider snapshots.
alter table public.payment_attempts
  add column if not exists provider_fee_pen numeric(12,4),
  add column if not exists provider_net_received_pen numeric(12,4);

alter table public.payment_attempts
  drop constraint if exists payment_attempts_provider_fee_pen_check,
  add constraint payment_attempts_provider_fee_pen_check
    check(provider_fee_pen is null or provider_fee_pen >= 0),
  drop constraint if exists payment_attempts_provider_net_received_pen_check,
  add constraint payment_attempts_provider_net_received_pen_check
    check(provider_net_received_pen is null or provider_net_received_pen >= 0);

create or replace function public.admin_metrics() returns jsonb
language sql
security invoker
set search_path=''
as $$
select jsonb_build_object(
  'orders_today',(select count(*) from public.orders where (created_at at time zone 'America/Lima')::date=(now() at time zone 'America/Lima')::date),
  'pending',(select count(*) from public.orders where status in ('PAYMENT_PENDING','PAYMENT_REVIEW')),
  'paid_reports',(select count(*) from public.orders where paid_at is not null),
  'ready',(select count(*) from public.orders where status='REPORT_READY'),
  'partial',(select count(*) from public.orders where status='REPORT_PARTIAL'),
  'failed',(select count(*) from public.orders where status='FAILED'),
  'reports_today',(select count(*) from public.reports where (created_at at time zone 'America/Lima')::date=(now() at time zone 'America/Lima')::date),
  'revenue',(select coalesce(sum(amount_pen),0) from public.orders where paid_at is not null),
  'cost',(select coalesce(sum(cost_pen),0) from public.provider_calls),
  'average_cost',(select coalesce(sum(c.cost_pen),0)/greatest((select count(*) from public.reports),1) from public.provider_calls c),
  'provider_success_rate',(select coalesce(100.0*count(*) filter(where status in ('VERIFIED','NOT_FOUND'))/nullif(count(*),0),0) from public.provider_calls),
  'average_duration_ms',(select coalesce(avg(q.latency_ms),0) from public.vehicle_queries q join public.reports r on r.query_id=q.id),
  'mp_live_approved',(select count(*) from public.payment_attempts where live_mode=true and ever_approved=true),
  'mp_financials_known',(select count(*) from public.payment_attempts where live_mode=true and ever_approved=true and provider_net_received_pen is not null),
  'mp_gross',(select coalesce(sum(amount_minor),0)/100.0 from public.payment_attempts where live_mode=true and ever_approved=true),
  'mp_fee',(select coalesce(sum(provider_fee_pen),0) from public.payment_attempts where live_mode=true and ever_approved=true),
  'mp_net',(select coalesce(sum(provider_net_received_pen),0) from public.payment_attempts where live_mode=true and ever_approved=true and provider_net_received_pen is not null),
  'mp_deductions',(select coalesce(sum(greatest((amount_minor/100.0)-provider_net_received_pen,0)),0) from public.payment_attempts where live_mode=true and ever_approved=true and provider_net_received_pen is not null),
  'net_after_payment_fees',(
    (select coalesce(sum(amount_pen),0) from public.orders where paid_at is not null)
    -
    (select coalesce(sum(greatest((amount_minor/100.0)-provider_net_received_pen,0)),0) from public.payment_attempts where live_mode=true and ever_approved=true and provider_net_received_pen is not null)
  ),
  'contribution_after_payment_and_data',(
    (select coalesce(sum(amount_pen),0) from public.orders where paid_at is not null)
    -
    (select coalesce(sum(greatest((amount_minor/100.0)-provider_net_received_pen,0)),0) from public.payment_attempts where live_mode=true and ever_approved=true and provider_net_received_pen is not null)
    -
    (select coalesce(sum(cost_pen),0) from public.provider_calls)
  )
);
$$;
