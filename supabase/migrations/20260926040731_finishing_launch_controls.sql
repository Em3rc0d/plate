-- Forward-only launch controls. Initial migration remains unchanged.
alter table public.orders add column terms_version text, add column privacy_version text, add column accepted_at timestamptz,
 add column generation_token uuid, add column generation_attempts integer not null default 0,
 add column recovered_at timestamptz, add column proof_uploaded_at timestamptz, add column proof_deleted_at timestamptz;
alter table public.reports add column share_code text unique, add column revision integer not null default 1,
 add column pdf_status text not null default 'PENDING' check(pdf_status in ('PENDING','READY','FAILED','EXPIRED')),
 add column delivery_token uuid, add column delivery_started_at timestamptz, add column delivery_attempted_at timestamptz,
 add column pdf_deleted_at timestamptz, add column retired_pdf_paths text[] not null default '{}';
update public.reports set pdf_status='READY' where pdf_path is not null;
alter table public.reports add constraint email_status_values check(email_status in ('PENDING','SENT','FAILED','NOT_CONFIGURED'));
create index orders_processing_age on public.orders(processing_started_at) where status='REPORT_PROCESSING';
create index reports_retention on public.reports(created_at) where pdf_deleted_at is null;
create table public.generation_requests(request_id uuid primary key,order_id uuid not null references public.orders,created_at timestamptz not null default now());
alter table public.generation_requests enable row level security;
revoke all on public.generation_requests from anon,authenticated;grant all on public.generation_requests to service_role;grant select on public.generation_requests to authenticated;
create policy admin_read on public.generation_requests for select to authenticated using ((select auth.jwt())->'app_metadata'->>'role'='admin');
-- Retire unsafe old entrypoints: generation commits must present their attempt token.
drop function public.claim_report(uuid);
drop function public.commit_report(uuid,uuid,text,jsonb,jsonb,numeric,text);
create function public.begin_report(p_id uuid,p_recovery boolean,p_force boolean,p_stale_minutes integer,p_request uuid) returns uuid
language plpgsql security invoker set search_path='' as $$ declare o public.orders%rowtype;a uuid;has_report boolean;n integer;begin
select * into o from public.orders where id=p_id for update;
if not found or o.paid_at is null then return null;end if;
select exists(select 1 from public.reports where order_id=p_id) into has_report;
if has_report and not p_force then return null;end if;
if exists(select 1 from public.reports where order_id=p_id and delivery_token is not null and delivery_started_at>now()-interval '5 minutes') then return null;end if;
if o.status='REPORT_PROCESSING' and coalesce(o.processing_started_at, o.created_at)>now()-make_interval(mins=>greatest(6,p_stale_minutes)) then return null;end if;
if not(o.status='PAID' or (p_recovery and (o.status='FAILED' or o.status='REPORT_PROCESSING' or (p_force and o.status in ('REPORT_READY','REPORT_PARTIAL'))))) then return null;end if;
if p_recovery and p_request is null then return null;end if;
if p_request is not null then insert into public.generation_requests(request_id,order_id) values(p_request,p_id) on conflict do nothing;get diagnostics n=row_count;if n=0 then return null;end if;end if;
a=gen_random_uuid();update public.orders set generation_token=a,generation_attempts=generation_attempts+1,status='REPORT_PROCESSING',processing_started_at=now(),failure_code=null,recovered_at=case when p_recovery then now() else recovered_at end where id=p_id;return a;end $$;
create function public.claim_delivery(p_id uuid,p_revision integer,p_token uuid) returns boolean language plpgsql security invoker set search_path='' as $$ declare n integer;begin
-- Same order lock as generation prevents starting delivery during a forced refresh.
perform 1 from public.orders where id=(select order_id from public.reports where id=p_id) and status in ('REPORT_READY','REPORT_PARTIAL') for update;if not found then return false;end if;
update public.reports set delivery_token=p_token,delivery_started_at=now() where id=p_id and revision=p_revision and (delivery_token is null or delivery_started_at<now()-interval '5 minutes');get diagnostics n=row_count;return n=1;end $$;
create function public.commit_report(p_order uuid,p_query uuid,p_code text,p_report jsonb,p_summary jsonb,p_cost numeric,p_status text,p_attempt uuid) returns uuid language plpgsql security invoker set search_path='' as $$ declare v uuid;r uuid;begin
if not exists(select 1 from public.orders where id=p_order and status='REPORT_PROCESSING' and generation_token=p_attempt for update) then raise exception 'INVALID_STATE';end if;
insert into public.vehicles(plate,vin,brand,model,manufacture_year,model_year,color,engine,canonical_json) values(p_report#>>'{identity,plate}',p_report#>>'{identity,vin}',p_report#>>'{identity,brand}',p_report#>>'{identity,model}',nullif(p_report#>>'{identity,manufactureYear}','')::integer,nullif(p_report#>>'{identity,modelYear}','')::integer,p_report#>>'{identity,color}',p_report#>>'{identity,engine}',p_report) on conflict(plate) do update set canonical_json=excluded.canonical_json,vin=excluded.vin,brand=excluded.brand,model=excluded.model,manufacture_year=excluded.manufacture_year,model_year=excluded.model_year,color=excluded.color,engine=excluded.engine,updated_at=now() returning id into v;
insert into public.reports(order_id,vehicle_id,query_id,public_code,report_json,summary_json,total_data_cost_pen,status) values(p_order,v,p_query,p_code,p_report,p_summary,p_cost,p_status)
on conflict(order_id) do update set vehicle_id=excluded.vehicle_id,query_id=excluded.query_id,report_json=excluded.report_json,summary_json=excluded.summary_json,total_data_cost_pen=public.reports.total_data_cost_pen+excluded.total_data_cost_pen,status=excluded.status,
revision=public.reports.revision+1,retired_pdf_paths=case when public.reports.pdf_path is null then public.reports.retired_pdf_paths else array_append(public.reports.retired_pdf_paths,public.reports.pdf_path) end,
pdf_path=null,pdf_status='PENDING',pdf_deleted_at=null,email_status='PENDING',delivery_token=null,delivery_started_at=null,created_at=now() returning id into r;
insert into public.vehicle_snapshots(vehicle_id,query_id,snapshot_json) values(v,p_query,p_report);
update public.orders set status=p_status where id=p_order;
update public.vehicle_queries set status=case when p_status='REPORT_READY' then 'COMPLETED' else 'PARTIAL' end,completed_at=now(),total_data_cost_pen=p_cost,latency_ms=extract(epoch from (now()-started_at))*1000 where id=p_query;return r;end $$;

revoke execute on function public.begin_report(uuid,boolean,boolean,integer,uuid),public.claim_delivery(uuid,integer,uuid),public.commit_report(uuid,uuid,text,jsonb,jsonb,numeric,text,uuid) from public,anon,authenticated;
grant execute on function public.begin_report(uuid,boolean,boolean,integer,uuid),public.claim_delivery(uuid,integer,uuid),public.commit_report(uuid,uuid,text,jsonb,jsonb,numeric,text,uuid) to service_role;
create or replace function public.admin_metrics() returns jsonb language sql security invoker set search_path='' as $$
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
'average_duration_ms',(select coalesce(avg(q.latency_ms),0) from public.vehicle_queries q join public.reports r on r.query_id=q.id)); $$;

update storage.buckets set public=false where id in ('payment-proofs','report-pdfs');

create function public.recover_existing_report(p_id uuid,p_stale_minutes integer) returns boolean language plpgsql security invoker set search_path='' as $$ declare o public.orders%rowtype;s text;begin
select * into o from public.orders where id=p_id for update;if not found or o.paid_at is null then return false;end if;
select status into s from public.reports where order_id=p_id and status in ('REPORT_READY','REPORT_PARTIAL');if not found then return false;end if;
if o.status='REPORT_PROCESSING' and coalesce(o.processing_started_at,o.created_at)>now()-make_interval(mins=>greatest(6,p_stale_minutes)) then return false;end if;
if o.status in ('FAILED','REPORT_PROCESSING','PAID') then update public.orders set status=s,generation_token=null,recovered_at=now(),failure_code=null where id=p_id;end if;
return true;end $$;
revoke execute on function public.recover_existing_report(uuid,integer) from public,anon,authenticated;
grant execute on function public.recover_existing_report(uuid,integer) to service_role;
