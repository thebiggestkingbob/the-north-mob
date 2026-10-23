begin;
create table public.media_assets (
 id uuid primary key,
 title text not null check(length(btrim(title)) between 2 and 200),
 alt text not null check(length(btrim(alt)) between 2 and 500),
 rights text not null check(length(btrim(rights)) between 5 and 1000),
 original_path text not null unique,
 derivative_path text not null unique,
 width integer not null check(width between 1 and 4000),
 height integer not null check(height between 1 and 4000),
 byte_size integer not null check(byte_size between 1 and 8388608),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz,
 check(original_path=id::text||'/original'), check(derivative_path=id::text||'/image.webp')
);
create table public.visualz_videos (
 id uuid primary key default gen_random_uuid(),
 youtube_id text not null unique check(youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
 title text not null default '' check(length(title)<=300),
 category text not null default 'music-video' check(category in ('music-video','behind-the-scenes','live','interview','studio')),
 sort_order integer not null default 0 check(sort_order between 0 and 1000),
 featured boolean not null default false,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz
);
create unique index one_featured_visualz on public.visualz_videos(featured) where featured and status='published';
create index visualz_public_order on public.visualz_videos(sort_order,id) where status='published';
create table public.visualz_photos (
 id uuid primary key default gen_random_uuid(),
 media_id uuid references public.media_assets(id),
 local_path text unique check(local_path ~ '^/assets/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$' and position('..' in local_path)=0),
 title text not null check(length(btrim(title)) between 2 and 200),
 album text not null default 'Mob Ties' check(length(album) between 1 and 200),
 sort_order integer not null default 0 check(sort_order between 0 and 1000),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz,
 check((media_id is null) <> (local_path is null))
);
create index photos_media_id on public.visualz_photos(media_id);
create index photos_public_order on public.visualz_photos(sort_order,id) where status='published';
create function studio_private.audit_content() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.studio_content_audit(actor_id,record_id,module,before_record,after_record)
 values(auth.uid(),new.id,TG_TABLE_NAME,case when TG_OP='UPDATE' then to_jsonb(old) end,to_jsonb(new));
 return new;
end; $$;
revoke all on function studio_private.audit_content() from public,anon,authenticated;
create function studio_private.prepare_content() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
 new.id:=old.id; new.created_at:=old.created_at; new.version:=old.version+1;
 else new.version:=1; end if;
 new.updated_at:=now();
 new.published_at:=case when new.status='published' then coalesce(case when TG_OP='UPDATE' then old.published_at end,now()) else null end;
 return new;
end; $$;
revoke all on function studio_private.prepare_content() from public,anon,authenticated;
do $$ declare tab text; begin
 foreach tab in array array['media_assets','visualz_videos','visualz_photos'] loop
 execute format('alter table public.%I enable row level security',tab);
 execute format('revoke all on public.%I from public,anon,authenticated',tab);
 execute format('grant select on public.%I to anon',tab);
 execute format('grant select,insert,update on public.%I to authenticated',tab);
 execute format('create policy published_read on public.%I for select to anon,authenticated using(status=''published'')',tab);
 execute format('create policy owner_read on public.%I for select to authenticated using((select studio_private.is_owner()))',tab);
 execute format('create policy owner_insert on public.%I for insert to authenticated with check((select studio_private.is_owner()))',tab);
 execute format('create policy owner_update on public.%I for update to authenticated using((select studio_private.is_owner())) with check((select studio_private.is_owner()))',tab);
 execute format('create trigger prepare_content before insert or update on public.%I for each row execute function studio_private.prepare_content()',tab);
 execute format('create trigger audit_content after insert or update on public.%I for each row execute function studio_private.audit_content()',tab);
 end loop;
end $$;
drop policy published_read on public.media_assets;
create policy published_read on public.media_assets for select to anon using(status='published');
revoke select on public.media_assets from anon;
grant select(id,title,alt,derivative_path,width,height,status) on public.media_assets to anon;
-- Originals never have an anonymous read policy. Only processed derivatives may be published.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('studio-originals','studio-originals',false,8388608,array['image/jpeg','image/png','image/webp']),
('studio-images','studio-images',false,8388608,array['image/webp']) on conflict(id) do nothing;
create policy studio_object_owner_read on storage.objects for select to authenticated using(bucket_id in ('studio-originals','studio-images') and (select studio_private.is_owner()));
create policy studio_object_owner_insert on storage.objects for insert to authenticated with check(bucket_id in ('studio-originals','studio-images') and (select studio_private.is_owner()));
create policy studio_object_owner_cleanup on storage.objects for delete to authenticated using(bucket_id in ('studio-originals','studio-images') and (select studio_private.is_owner()) and not exists(select 1 from public.media_assets m where m.original_path=name or m.derivative_path=name));
create policy published_image_read on storage.objects for select to anon,authenticated using(bucket_id='studio-images' and exists(select 1 from public.media_assets m where m.derivative_path=name and m.status='published'));
commit;
