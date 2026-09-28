-- TEST can never mark an order paid, even if a caller passes p_mark_paid=true.
create or replace function public.sync_mercado_pago_attempt(
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

  if p_live_mode is null or p_status not in ('PENDING','APPROVED','REJECTED','CANCELLED','REFUNDED','CHARGED_BACK','UNKNOWN') then
    raise exception 'INVALID_PROVIDER_SNAPSHOT';
  end if;

  if a.live_mode is not null and a.live_mode <> p_live_mode then
    raise exception 'PROVIDER_MODE_MISMATCH';
  end if;

  if a.status in ('REFUNDED','CHARGED_BACK') and p_status <> a.status then
    raise exception 'PAYMENT_STATE_REGRESSION';
  end if;

  if a.status in ('REJECTED','CANCELLED') and p_status <> a.status then
    raise exception 'PAYMENT_STATE_REGRESSION';
  end if;

  if a.ever_approved and p_status in ('PENDING','REJECTED','CANCELLED','UNKNOWN') then
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

  if p_status='APPROVED' and p_mark_paid is true and p_live_mode is true then
    update public.orders
    set status='PAID',
        paid_at=coalesce(paid_at,now()),
        payment_reference=p_provider_id
    where id=a.order_id
      and status in ('PAYMENT_PENDING','PAYMENT_REVIEW','REJECTED');
    get diagnostics n=row_count;
  end if;

  return n=1;
end
$$;

