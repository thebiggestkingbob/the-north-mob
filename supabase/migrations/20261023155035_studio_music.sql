begin;
create table public.music_releases (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=100),
 title text not null check(length(btrim(title)) between 2 and 200),
 artist text not null check(length(btrim(artist)) between 2 and 300),
 year text check(year ~ '^[0-9]{4}$'),
 kind text not null default 'album' check(kind in ('album','reference')),
 check(kind='reference' or year is not null),
 cover text check((cover ~ '^/assets/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$' and position('..' in cover)=0) or cover ~ '^/api/media/[a-f0-9-]{36}$'),
 spotify_uri text check(spotify_uri ~ '^spotify:(album|track):[A-Za-z0-9]{22}$'),
 source text not null check(source ~ '^https://open.spotify.com/(album|track)/[A-Za-z0-9]{22}$'),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),published_at timestamptz
);
create table public.music_tracks (
 id uuid primary key default gen_random_uuid(),
 catalogue_id text not null unique check(catalogue_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(catalogue_id)<=100),
 release_slug text not null references public.music_releases(slug),
 title text not null check(length(btrim(title)) between 1 and 300),
 artist text not null check(length(btrim(artist)) between 2 and 300),
 credits text not null check(length(credits)<=1000),
 duration text not null check(duration ~ '^[0-9]{1,3}:[0-5][0-9]$'),
 spotify_uri text check(spotify_uri ~ '^spotify:track:[A-Za-z0-9]{22}$'),
 source text not null check(source ~ '^https://open.spotify.com/(album|track)/[A-Za-z0-9]{22}$'),
 sort_order integer not null default 0 check(sort_order between 0 and 1000),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),published_at timestamptz
);
create index music_tracks_release on public.music_tracks(release_slug,sort_order);
do $$ declare tab text;begin
 foreach tab in array array['music_releases','music_tracks'] loop
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
-- Public tracks must also belong to a published release.
drop policy published_read on public.music_tracks;
create policy published_read on public.music_tracks for select to anon,authenticated using(status='published' and exists(select 1 from public.music_releases r where r.slug=release_slug and r.status='published'));
commit;
