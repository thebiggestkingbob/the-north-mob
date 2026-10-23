-- Studio foundation. No owner is provisioned automatically.
begin;
create schema if not exists studio_private;
revoke all on schema studio_private from public, anon;
grant usage on schema studio_private to authenticated;

create table public.staff_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'owner' check (role = 'owner'),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create unique index one_active_studio_owner on public.staff_members(role) where active;
alter table public.staff_members enable row level security;
revoke all on public.staff_members from public, anon, authenticated;
grant select on public.staff_members to authenticated;
create policy own_membership on public.staff_members for select to authenticated using (user_id = (select auth.uid()));

create function studio_private.is_owner() returns boolean language sql stable security invoker set search_path = '' as $$
 select exists(select 1 from public.staff_members where user_id = (select auth.uid()) and role = 'owner' and active);
$$;
revoke all on function studio_private.is_owner() from public, anon;
grant execute on function studio_private.is_owner() to authenticated;

create table public.events (
 id uuid primary key default gen_random_uuid(),
 legacy_key text unique,
 name text not null check (char_length(btrim(name)) between 2 and 200),
 date date not null,
 venue text not null check (char_length(btrim(venue)) between 2 and 300),
 timezone text not null default 'Africa/Johannesburg' check (timezone = 'Africa/Johannesburg'),
 ticket_url text check (ticket_url is null or (char_length(ticket_url) <= 2048 and ticket_url ~ '^https://[^[:space:]]+$')),
 status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
 version integer not null default 1 check (version > 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 published_at timestamptz
);
create index events_public_dates on public.events(date, id) where status = 'published';
alter table public.events enable row level security;
revoke all on public.events from public, anon, authenticated;
grant select on public.events to anon;
grant select, insert, update on public.events to authenticated;
create policy public_events on public.events for select to anon, authenticated using (status = 'published');
create policy owner_events_read on public.events for select to authenticated using ((select studio_private.is_owner()));
create policy owner_events_create on public.events for insert to authenticated with check ((select studio_private.is_owner()));
create policy owner_events_edit on public.events for update to authenticated using ((select studio_private.is_owner())) with check ((select studio_private.is_owner()));

create table public.studio_audit_events (
 id bigint generated always as identity primary key,
 actor_id uuid references auth.users(id) on delete set null,
 event_id uuid not null,
 action text not null check (action in ('created','updated','published','archived')),
 before_record jsonb,
 after_record jsonb not null,
 occurred_at timestamptz not null default now()
);
create index studio_audit_event_history on public.studio_audit_events(event_id, occurred_at desc);
alter table public.studio_audit_events enable row level security;
revoke all on public.studio_audit_events from public, anon, authenticated;
grant select on public.studio_audit_events to authenticated;
create policy owner_audit_read on public.studio_audit_events for select to authenticated using ((select studio_private.is_owner()));

create function studio_private.prepare_event() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if TG_OP = 'UPDATE' then
  new.id := old.id; new.legacy_key := old.legacy_key; new.created_at := old.created_at;
  new.version := old.version + 1;
 else new.version := 1; end if;
 new.updated_at := now();
 if new.status = 'published' then
  new.published_at := coalesce(case when TG_OP = 'UPDATE' then old.published_at end, now());
 else new.published_at := null; end if;
 return new;
end;
$$;
revoke all on function studio_private.prepare_event() from public, anon, authenticated;
create trigger prepare_event before insert or update on public.events for each row execute function studio_private.prepare_event();

-- Narrow definer trigger: append history in the same transaction as the event.
-- Not an exposed RPC; callers cannot insert, edit or delete audit rows.
create function studio_private.audit_event() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.studio_audit_events(actor_id,event_id,action,before_record,after_record)
 values(auth.uid(),new.id,
 case when new.status = 'published' and (TG_OP = 'INSERT' or old.status <> 'published') then 'published'
 when new.status = 'archived' and (TG_OP = 'INSERT' or old.status <> 'archived') then 'archived'
 when TG_OP = 'INSERT' then 'created' else 'updated' end,
 case when TG_OP = 'UPDATE' then to_jsonb(old) end,to_jsonb(new));
 return new;
end;
$$;
revoke all on function studio_private.audit_event() from public, anon, authenticated;
create trigger audit_event after insert or update on public.events for each row execute function studio_private.audit_event();
commit;
