-- A comment that its author edits goes back to the moderation queue as unseen, so an edit can't
-- be used to slip text past review (public + demo).

do $$
declare
  s text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format($f$
      create or replace function %1$I.requeue_moderation_from_comment_edit()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $fn$
      begin
        if new.content is distinct from old.content then
          insert into %1$I.moderation_queue (
            kind, entity_type, entity_id, entity_name, content, source_id, created_by
          ) values (
            'comment', new.entity_type, new.entity_id,
            %1$I.entity_display_name(new.entity_type, new.entity_id),
            new.content, new.id, new.user_id
          )
          on conflict (kind, source_id) do update
            set content = excluded.content, seen_at = null, seen_by = null, created_at = now();
        end if;
        return new;
      end
      $fn$
    $f$, s);

    execute format('drop trigger if exists comments_requeue_moderation on %I.comments', s);
    execute format(
      'create trigger comments_requeue_moderation after update of content on %I.comments for each row execute function %I.requeue_moderation_from_comment_edit()',
      s, s);
    execute format('revoke all on function %I.requeue_moderation_from_comment_edit() from public, anon, authenticated', s);
  end loop;
end
$$;

notify pgrst, 'reload schema';
