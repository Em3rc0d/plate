-- Cover foreign-key columns reported by Supabase Performance Advisor after launch migrations.
create index if not exists generation_requests_order_id_idx on public.generation_requests(order_id);
create index if not exists orders_approved_by_idx on public.orders(approved_by) where approved_by is not null;
create index if not exists reports_vehicle_id_idx on public.reports(vehicle_id) where vehicle_id is not null;
create index if not exists vehicle_snapshots_vehicle_id_idx on public.vehicle_snapshots(vehicle_id) where vehicle_id is not null;
