begin;
insert into public.staff_members(user_id,role,active) values ('00000000-0000-4000-8000-000000000001','owner',true) on conflict(user_id) do update set active=true;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
insert into public.music_releases(slug,title,artist,year,cover,source,status) values ('private-fixture','Private release','North Mob','2026','/assets/h4b-album-cover.jpg','https://open.spotify.com/album/3f1HZdfe4bPLqQOu5sfmvO','draft');
insert into public.music_tracks(catalogue_id,release_slug,title,artist,credits,duration,source,status) values ('private-track','private-fixture','Draft fixture','North Mob','','03:02','https://open.spotify.com/album/3f1HZdfe4bPLqQOu5sfmvO','published');
reset role;
set local role anon;
do $$ begin
 if exists(select 1 from public.music_releases where slug='private-fixture') then raise exception 'Draft release exposed'; end if;
 if exists(select 1 from public.music_tracks where catalogue_id='private-track') then raise exception 'Track from draft release exposed'; end if;
 if (select count(*) from public.music_tracks)<>13 then raise exception 'Approved track count changed'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
update public.music_releases set status='published' where slug='private-fixture' and version=1;
do $$ begin
 if (select version from public.music_releases where slug='private-fixture')<>2 then raise exception 'Release version did not increment';end if;
 if (select count(*) from public.studio_content_audit where module='music_releases' and after_record->>'slug'='private-fixture')<>2 then raise exception 'Music audit missing';end if;
end $$;
reset role;
set local role anon;
do $$ begin
 if not exists(select 1 from public.music_tracks where catalogue_id='private-track') then raise exception 'Published track unavailable'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ begin
 begin
 update public.music_tracks set title='Unauthorized' where catalogue_id='private-track';
 if found then raise exception 'Non-owner changed track';end if;
 exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
