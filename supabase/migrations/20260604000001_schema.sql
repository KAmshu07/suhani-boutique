-- Foundation schema: content + customers + lead capture.
-- Enums are text + CHECK, mirroring data/constants.ts. All ids are uuid.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin')),
  name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Phone is the unique customer identity; auth_user_id reserved for future login.
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  notes text,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads captured from the public booking/contact forms.
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  service_slug text,
  requested_date date,
  message text,
  status text not null default 'new' check (status in ('new','contacted','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index booking_requests_status_idx on public.booking_requests(status);

-- CMS content. name/description trilingual jsonb {en,hi,cg}; price is a display
-- string; icon is a key mapped to an icon component in the UI.
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb,
  price text,
  icon text,
  image_url text,
  display_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text,
  url text,
  category text not null check (category in ('bridal','festival','daily','alterations','fabric')),
  alt text,
  display_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  service text,
  quote jsonb,
  rating int check (rating between 1 and 5),
  is_visible boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Singletons: business_info, about, hero, announcement. Publicly readable —
-- never store secrets here.
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
