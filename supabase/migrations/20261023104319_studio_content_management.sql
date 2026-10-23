begin;
create table public.artist_profiles (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=100),
 name text not null check (length(btrim(name)) between 2 and 120),
 tagline text not null default '' check (length(tagline)<=300),
 bio text not null default '' check (length(bio)<=5000),
 portrait text not null check (portrait ~ '^/assets/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$' and position('..' in portrait)=0),
 position text not null default '50% 50%' check (position ~ '^[0-9]{1,3}% [0-9]{1,3}%$'),
 sort_order integer not null default 0 check (sort_order between 0 and 1000),
 status text not null default 'draft' check (status in ('draft','published','archived')),
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz
);
alter table public.artist_profiles enable row level security;
revoke all on public.artist_profiles from public,anon,authenticated;
grant select on public.artist_profiles to anon;
grant select,insert,update on public.artist_profiles to authenticated;
create policy published_artists on public.artist_profiles for select to anon,authenticated using(status='published');
create policy owner_artists_read on public.artist_profiles for select to authenticated using((select studio_private.is_owner()));
create policy owner_artists_create on public.artist_profiles for insert to authenticated with check((select studio_private.is_owner()));
create policy owner_artists_update on public.artist_profiles for update to authenticated using((select studio_private.is_owner())) with check((select studio_private.is_owner()));
create index artists_public_order on public.artist_profiles(sort_order,id) where status='published';
create function studio_private.prepare_artist() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
 new.id:=old.id; new.slug:=old.slug; new.created_at:=old.created_at; new.version:=old.version+1;
 else new.version:=1; end if;
 new.updated_at:=now();
 new.published_at:=case when new.status='published' then coalesce(case when TG_OP='UPDATE' then old.published_at end,now()) else null end;
 return new;
end; $$;
revoke all on function studio_private.prepare_artist() from public,anon,authenticated;
create trigger prepare_artist before insert or update on public.artist_profiles for each row execute function studio_private.prepare_artist();
create table public.studio_content_audit (
 id bigint generated always as identity primary key,
 actor_id uuid references auth.users(id) on delete set null,
 record_id uuid not null, module text not null,
 before_record jsonb, after_record jsonb not null, occurred_at timestamptz not null default now()
);
alter table public.studio_content_audit enable row level security;
revoke all on public.studio_content_audit from public,anon,authenticated;
grant select on public.studio_content_audit to authenticated;
create policy owner_content_audit on public.studio_content_audit for select to authenticated using((select studio_private.is_owner()));
create index content_audit_history on public.studio_content_audit(record_id,occurred_at desc);
create function studio_private.audit_artist() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.studio_content_audit(actor_id,record_id,module,before_record,after_record)
 values(auth.uid(),new.id,'artists',case when TG_OP='UPDATE' then to_jsonb(old) end,to_jsonb(new));
 return new;
end; $$;
revoke all on function studio_private.audit_artist() from public,anon,authenticated;
create trigger audit_artist after insert or update on public.artist_profiles for each row execute function studio_private.audit_artist();
commit;
