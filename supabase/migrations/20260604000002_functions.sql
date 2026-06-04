-- updated_at maintenance
create or replace function public.set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_customers_updated before update on public.customers for each row execute function public.set_updated_at();
create trigger trg_booking_updated before update on public.booking_requests for each row execute function public.set_updated_at();
create trigger trg_services_updated before update on public.services for each row execute function public.set_updated_at();
create trigger trg_gallery_updated before update on public.gallery_images for each row execute function public.set_updated_at();
create trigger trg_testimonials_updated before update on public.testimonials for each row execute function public.set_updated_at();
create trigger trg_settings_updated before update on public.settings for each row execute function public.set_updated_at();

-- is_admin(): SECURITY DEFINER + fixed search_path. The DEFINER context makes the
-- internal profiles read bypass RLS, so it does NOT recurse with profiles policies.
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- Auto-create a profile for every new auth user (resolves the user<->profile FK
-- ordering: the profile row exists as soon as the auth user does).
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role) values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
