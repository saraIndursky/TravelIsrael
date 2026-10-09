-- TravelIsrael — Storage bucket and policies.
-- Storage is shared between the public and demo schemas.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Each user owns the folder named after their uid: avatars/<uid>/<file>
create policy "avatars_public_read" on storage.objects
  for select to public
  using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Content images (trips / places / trails) — also in 20_content_images_storage.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "content_images_public_read" on storage.objects
  for select to public
  using (bucket_id = 'content-images');

create policy "content_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'content-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "content_images_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'content-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'content-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "content_images_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'content-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
