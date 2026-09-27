-- Mercado Pago Checkout API payment core for PlacaClara.
-- Keeps manual Yape/Plin as fallback while adding tokenized Yape + card payments.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check(payment_method in ('YAPE','PLIN','MP_YAPE','MP_CARD'));

create table public.payment_attempts(
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  request_key_hash text not null unique,
  fingerprint text not null,
  payment_method_id text not null,
  amount_minor integer not null check(amount_minor > 0),
  currency text not null default 'PEN' check(currency = 'PEN'),
  provider_payment_id text unique,
  provider_status text,
  status text not null default 'CREATING'
    check(status in ('CREATING','PENDING','APPROVED','REJECTED','CANCELLED','REFUNDED','CHARGED_BACK','UNKNOWN')),
  live_mode boolean,
  provider_updated_at timestamptz,
  ever_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index payment_attempts_active_order
  on public.payment_attempts(order_id)
  where status in ('CREATING','PENDING','APPROVED','UNKNOWN');

create index payment_attempts_order_created
  on public.payment_attempts(order_id, created_at desc);

alter table public.payment_attempts enable row level security;
revoke all on public.payment_attempts from anon, authenticated;
grant all on public.payment_attempts to service_role;
grant select on public.payment_attempts to authenticated;
create policy admin_read on public.payment_attempts
  for select to authenticated
  using ((select auth.jwt())->'app_metadata'->>'role'='admin');

create function public.claim_mercado_pago_attempt(
  p_order uuid,
  p_request_key_hash text,
  p_fingerprint text,
  p_payment_method_id text
) returns table(attempt_id uuid, created boolean)
language plpgsql
security invoker
set search_path=''
as $$
declare
  o public.orders%rowtype;
  a public.payment_attempts%rowtype;
begin
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if o.status not in ('PAYMENT_PENDING','REJECTED') then
    raise exception 'ORDER_NOT_PAYABLE';
  end if;

  select * into a
  from public.payment_attempts
  where request_key_hash=p_request_key_hash;

  if found then
    if a.order_id <> p_order or a.fingerprint <> p_fingerprint then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return query select a.id, false;
    return;
  end if;

  if exists(
    select 1 from public.payment_attempts
    where order_id=p_order
      and status in ('CREATING','PENDING','APPROVED','UNKNOWN')
  ) then
    raise exception 'PAYMENT_ALREADY_ACTIVE';
  end if;

  insert into public.payment_attempts(
    order_id, request_key_hash, fingerprint, payment_method_id,
    amount_minor, currency
  ) values (
    p_order, p_request_key_hash, p_fingerprint, p_payment_method_id,
    round(o.amount_pen * 100)::integer, 'PEN'
  )
  returning * into a;

  return query select a.id, true;
end
$$;

create function public.sync_mercado_pago_attempt(
  p_attempt uuid,
  p_provider_id text,
  p_provider_status text,
  p_status text,
  p_live_mode boolean,
  p_updated_at timestamptz,
  p_mark_paid boolean
) returns boolean
language plpgsql
security invoker
set search_path=''
as $$
declare
  a public.payment_attempts%rowtype;
  n integer := 0;
begin
  select * into a from public.payment_attempts where id=p_attempt for update;
  if not found then raise exception 'PAYMENT_ATTEMPT_NOT_FOUND'; end if;

  if a.provider_payment_id is not null and a.provider_payment_id <> p_provider_id then
    raise exception 'PROVIDER_ID_MISMATCH';
  end if;

  if a.provider_updated_at is not null and p_updated_at < a.provider_updated_at then
    return false;
  end if;

  if a.ever_approved and p_status in ('PENDING','REJECTED','CANCELLED') then
    raise exception 'PAYMENT_STATE_REGRESSION';
  end if;

  update public.payment_attempts
  set provider_payment_id=coalesce(provider_payment_id,p_provider_id),
      provider_status=p_provider_status,
      status=p_status,
      live_mode=p_live_mode,
      provider_updated_at=p_updated_at,
      ever_approved=ever_approved or p_status='APPROVED',
      updated_at=now()
  where id=p_attempt;

  if p_status='APPROVED' and p_mark_paid then
    update public.orders
    set status='PAID',
        paid_at=coalesce(paid_at,now()),
        payment_reference=p_provider_id
    where id=a.order_id
      and status in ('PAYMENT_PENDING','REJECTED');
    get diagnostics n=row_count;
  end if;

  return n=1;
end
$$;

revoke execute on function
  public.claim_mercado_pago_attempt(uuid,text,text,text),
  public.sync_mercado_pago_attempt(uuid,text,text,text,boolean,timestamptz,boolean)
from public, anon, authenticated;

grant execute on function
  public.claim_mercado_pago_attempt(uuid,text,text,text),
  public.sync_mercado_pago_attempt(uuid,text,text,text,boolean,timestamptz,boolean)
to service_role;
