-- Libro de Reclamaciones virtual. PII remains private; public writes happen only server-side.
create table public.consumer_claims(
  id uuid primary key default gen_random_uuid(),
  claim_number bigint generated always as identity unique,
  kind text not null check(kind in ('RECLAMO','QUEJA')),
  consumer_name text not null,
  document_type text not null check(document_type in ('DNI','CE','PASAPORTE','RUC')),
  document_number text not null,
  address text not null,
  email text not null,
  phone text not null,
  is_minor boolean not null default false,
  representative_name text,
  representative_document text,
  item_type text not null default 'SERVICIO' check(item_type in ('PRODUCTO','SERVICIO')),
  item_description text not null,
  amount_pen numeric(10,2) not null default 0 check(amount_pen >= 0),
  detail text not null,
  consumer_request text not null,
  response_channel text not null check(response_channel in ('EMAIL','DOMICILIO')),
  status text not null default 'OPEN' check(status in ('OPEN','ANSWERED')),
  provider_response text,
  provider_observations text,
  responded_at timestamptz,
  responded_by uuid references auth.users,
  created_at timestamptz not null default now()
);
create index consumer_claims_status_created on public.consumer_claims(status,created_at desc);
alter table public.consumer_claims enable row level security;
revoke all on public.consumer_claims from anon,authenticated;
grant all on public.consumer_claims to service_role;
grant select on public.consumer_claims to authenticated;
create policy admin_read on public.consumer_claims
  for select to authenticated
  using ((select auth.jwt())->'app_metadata'->>'role'='admin');
