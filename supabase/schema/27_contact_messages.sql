-- Contact form messages (public + demo).
-- Anyone (including guests) can send a message; only admins can read, mark as handled or delete.

do $$
declare
  s text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format($t$
      create table if not exists %1$I.contact_messages (
        id uuid primary key default gen_random_uuid(),
        name text not null check (char_length(name) between 2 and 80),
        email text not null check (char_length(email) between 5 and 200),
        subject text not null check (char_length(subject) between 3 and 120),
        message text not null check (char_length(message) between 10 and 2000),
        user_id uuid references %1$I.profiles(id) on delete set null,
        status text not null default 'new' check (status in ('new', 'handled')),
        created_at timestamptz not null default now(),
        handled_at timestamptz,
        handled_by uuid references %1$I.profiles(id) on delete set null
      )
    $t$, s);

    execute format('create index if not exists contact_messages_status_idx on %I.contact_messages (status, created_at desc)', s);
    execute format('alter table %I.contact_messages enable row level security', s);

    execute format('drop policy if exists contact_messages_insert on %I.contact_messages', s);
    execute format(
      'create policy contact_messages_insert on %I.contact_messages for insert to anon, authenticated with check (status = ''new'' and handled_at is null and (user_id is null or user_id = auth.uid()))',
      s
    );
    execute format('drop policy if exists contact_messages_admin_select on %I.contact_messages', s);
    execute format('create policy contact_messages_admin_select on %1$I.contact_messages for select to authenticated using (%1$I.is_admin())', s);
    execute format('drop policy if exists contact_messages_admin_update on %I.contact_messages', s);
    execute format('create policy contact_messages_admin_update on %1$I.contact_messages for update to authenticated using (%1$I.is_admin()) with check (%1$I.is_admin())', s);
    execute format('drop policy if exists contact_messages_admin_delete on %I.contact_messages', s);
    execute format('create policy contact_messages_admin_delete on %1$I.contact_messages for delete to authenticated using (%1$I.is_admin())', s);

    execute format('grant insert on %I.contact_messages to anon', s);
    execute format('grant select, insert, update, delete on %I.contact_messages to authenticated, service_role', s);
  end loop;
end
$$;
