-- Region requests (public + demo).
-- A user who can't find a fitting region may propose a new one (with a parent region). It stays
-- "pending" and is only visible to its creator and admins. When an admin approves a place, trail
-- or trip that uses a pending region, the region is approved with it and becomes available to
-- everyone. Admins can also approve or reject regions from the regions admin page.

do $$
declare
  s text;
  t text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format('alter table %I.regions add column if not exists status text not null default ''approved''', s);
    execute format(
      'alter table %I.regions add column if not exists created_by uuid references %I.profiles(id) on delete set null',
      s, s
    );

    if not exists (
      select 1 from pg_constraint
      where conname = 'regions_status_check' and conrelid = (s || '.regions')::regclass
    ) then
      execute format(
        'alter table %I.regions add constraint regions_status_check check (status in (''approved'', ''pending'', ''rejected''))',
        s
      );
    end if;

    -- Reading: approved regions for everyone, pending ones only for their creator and admins.
    execute format('drop policy if exists regions_public_read on %I.regions', s);
    execute format(
      'create policy regions_public_read on %1$I.regions for select using (status = ''approved'' or created_by = auth.uid() or %1$I.is_admin())',
      s
    );

    -- Proposing: signed-in users may only insert their own pending, selectable region with a parent.
    execute format('drop policy if exists regions_request_insert on %I.regions', s);
    execute format(
      'create policy regions_request_insert on %I.regions for insert to authenticated with check (status = ''pending'' and created_by = auth.uid() and is_selectable and code is not null and parent_id is not null)',
      s
    );

    execute format($f$
      create or replace function %1$I.approve_region_with_content()
      returns trigger
      language plpgsql
      security definer
      set search_path = %1$I, public
      as $fn$
      begin
        if new.status = 'approved' and new.region_id is not null then
          update %1$I.regions set status = 'approved' where id = new.region_id and status = 'pending';
        end if;
        return new;
      end
      $fn$
    $f$, s);

    foreach t in array array['places', 'trails', 'trips'] loop
      execute format('drop trigger if exists %I_approve_region on %I.%I', t, s, t);
      execute format(
        'create trigger %I_approve_region after insert or update of status on %I.%I for each row execute function %I.approve_region_with_content()',
        t, s, t, s
      );
    end loop;
  end loop;
end
$$;
