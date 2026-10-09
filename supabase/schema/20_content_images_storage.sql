-- TravelIsrael — public content images bucket (trips / places / trails).

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

-- Path: content-images/<uid>/<uuid>.<ext>
drop policy if exists "content_images_public_read" on storage.objects;
create policy "content_images_public_read" on storage.objects
  for select to public
  using (bucket_id = 'content-images');

drop policy if exists "content_images_insert_own" on storage.objects;
create policy "content_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'content-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "content_images_update_own" on storage.objects;
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

drop policy if exists "content_images_delete_own" on storage.objects;
create policy "content_images_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'content-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
