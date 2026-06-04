alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.booking_requests enable row level security;
alter table public.services enable row level security;
alter table public.gallery_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;

-- profiles: own row readable/updatable (role NOT self-elevatable); admin sees all.
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_select_admin on public.profiles for select using (public.is_admin());
create policy profiles_update_own_no_role on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
create policy profiles_admin_write on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- content: public reads visible rows (admin reads all), admin writes everything.
create policy services_public_read on public.services for select using (is_visible or public.is_admin());
create policy services_admin_write on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy gallery_public_read on public.gallery_images for select using (is_visible or public.is_admin());
create policy gallery_admin_write on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());
create policy testimonials_public_read on public.testimonials for select using (is_visible or public.is_admin());
create policy testimonials_admin_write on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

-- settings: world-readable (non-secret only), admin writes.
create policy settings_public_read on public.settings for select using (true);
create policy settings_admin_write on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- customers: admin only.
create policy customers_admin_all on public.customers for all using (public.is_admin()) with check (public.is_admin());

-- booking_requests: anyone may submit a lead; only admin reads/manages.
create policy booking_insert_anon on public.booking_requests for insert with check (true);
create policy booking_admin_read on public.booking_requests for select using (public.is_admin());
create policy booking_admin_update on public.booking_requests for update using (public.is_admin()) with check (public.is_admin());
create policy booking_admin_delete on public.booking_requests for delete using (public.is_admin());
