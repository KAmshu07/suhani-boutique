-- Order Book: orders, garments (order_items), and a payments ledger.
-- Runs as the postgres role (bypasses RLS). is_admin() and set_updated_at() already
-- exist from the Foundation migrations.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'booked'
    check (status in ('booked','consulted','measured','fabric_selected','in_progress','ready_for_fitting','alterations','completed','delivered')),
  is_rush boolean not null default false,
  notes text,
  order_date date not null default current_date,
  due_date date,
  delivered_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index orders_order_no_idx on public.orders(order_no);
create index orders_customer_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);

-- One row per garment. Each carries its own stage (independent of the order headline).
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  garment_type text,
  description text,
  price numeric(10,2) not null default 0,
  status text not null default 'booked'
    check (status in ('booked','consulted','measured','fabric_selected','in_progress','ready_for_fitting','alterations','completed','delivered')),
  measurements text,
  fabric_notes text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);

-- Append-only payment ledger (insert/delete only; no updated_at).
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(10,2) not null,
  method text not null check (method in ('cash','upi')),
  received_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);
create index payments_order_idx on public.payments(order_id);

-- updated_at triggers (orders + order_items only; payments are append-only)
create trigger trg_orders_updated before update on public.orders for each row execute function public.set_updated_at();
create trigger trg_order_items_updated before update on public.order_items for each row execute function public.set_updated_at();

-- RLS: admin only
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create policy orders_admin_all on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy order_items_admin_all on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy payments_admin_all on public.payments for all using (public.is_admin()) with check (public.is_admin());
