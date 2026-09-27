-- Run against an isolated PostgreSQL-compatible database after both MP migrations.
-- Never run these fixtures against production.
do $$
declare
 o uuid := gen_random_uuid(); a uuid; b uuid; made boolean;
 fulfilled boolean; t timestamptz := now(); n integer; failed boolean;
begin
 insert into public.orders(id,status,amount_pen,payment_method) values(o,'PAYMENT_PENDING',15.90,'MP_YAPE');
 select attempt_id,created into a,made from public.claim_mercado_pago_attempt(o,'request1','fingerprint1','yape');
 if not made then raise exception 'first claim must create'; end if;
 select attempt_id,created into b,made from public.claim_mercado_pago_attempt(o,'request1','fingerprint1','yape');
 if made or a<>b then raise exception 'same key must reuse'; end if;
 select attempt_id,created into b,made from public.claim_mercado_pago_attempt(o,'request2','fingerprint2','yape');
 if made or a<>b then raise exception 'active order must reuse'; end if;
 failed:=false;
 begin
  perform public.claim_mercado_pago_attempt(o,'request1','changed','yape');
 exception when others then
  if sqlerrm <> 'IDEMPOTENCY_CONFLICT' then raise; end if;
  failed:=true;
 end;
 if not failed then raise exception 'fingerprint conflict accepted'; end if;
 -- Deliberately pass mark_paid=true: TEST still MUST NOT pay.
 fulfilled:=public.sync_mercado_pago_attempt(a,'777','approved','APPROVED',false,t,true);
 if fulfilled or (select status from public.orders where id=o)<>'PAYMENT_PENDING' then raise exception 'TEST fulfilled'; end if;
 if (select status from public.payment_attempts where id=a)<>'APPROVED' then raise exception 'TEST not persisted'; end if;
 perform public.sync_mercado_pago_attempt(a,'777','pending','PENDING',false,t-interval '1 second',false);
 if (select status from public.payment_attempts where id=a)<>'APPROVED' then raise exception 'stale event overwrote'; end if;
 failed:=false;
 begin
  perform public.sync_mercado_pago_attempt(a,'777','pending','PENDING',false,t+interval '1 second',false);
 exception when others then
  if sqlerrm <> 'PAYMENT_STATE_REGRESSION' then raise; end if;
  failed:=true;
 end;
 if not failed then raise exception 'approved regressed'; end if;
 failed:=false;
 begin
  perform public.sync_mercado_pago_attempt(a,'777','approved','APPROVED',true,t+interval '2 seconds',true);
 exception when others then
  if sqlerrm <> 'PROVIDER_MODE_MISMATCH' then raise; end if;
  failed:=true;
 end;
 if not failed then raise exception 'TEST upgraded to LIVE'; end if;
 perform public.sync_mercado_pago_attempt(a,'777','refunded','REFUNDED',false,t+interval '3 seconds',false);
 failed:=false;
 begin
  perform public.sync_mercado_pago_attempt(a,'777','approved','APPROVED',false,t+interval '4 seconds',true);
 exception when others then
  if sqlerrm <> 'PAYMENT_STATE_REGRESSION' then raise; end if;
  failed:=true;
 end;
 if not failed then raise exception 'refund regressed'; end if;
 select attempt_id,created into b,made from public.claim_mercado_pago_attempt(o,'request3','fingerprint3','yape');
 if not made or a=b then raise exception 'terminal attempt prevents explicit new request'; end if;
 perform public.sync_mercado_pago_attempt(b,'778','rejected','REJECTED',false,t,false);
 select count(*) into n from public.payment_attempts where order_id=o;
 if n<>2 then raise exception 'incorrect attempt count'; end if;
end $$;
