-- Public bucket for Mom's uploaded images; write/delete restricted to admins.
insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true)
  on conflict (id) do nothing;

create policy site_images_public_read on storage.objects for select
  using (bucket_id = 'site-images');

create policy site_images_admin_insert on storage.objects for insert
  with check (bucket_id = 'site-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy site_images_admin_update on storage.objects for update
  using (bucket_id = 'site-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy site_images_admin_delete on storage.objects for delete
  using (bucket_id = 'site-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
