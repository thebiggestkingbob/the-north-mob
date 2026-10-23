\set ON_ERROR_STOP on
begin;
insert into public.staff_members(user_id) values ('00000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
insert into public.artist_profiles(slug,name,portrait,status) values('test-artist','Test artist','/assets/artists/trophy.webp','draft');
do $$ begin
 if (select count(*) from public.artist_profiles)<>5 then raise exception 'Owner draft inaccessible';end if;
 if (select count(*) from public.studio_content_audit where module='artists' and after_record->>'slug'='test-artist')<>1 then raise exception 'Missing artist audit';end if;
end $$;
reset role;set local role anon;
do $$ begin
 if (select count(*) from public.artist_profiles)<>4 then raise exception 'Draft exposed';end if;
 begin perform * from public.studio_content_audit;raise exception 'Audit exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ declare affected integer;begin
 update public.artist_profiles set name='Unauthorized';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Unauthorized edit';end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
update public.artist_profiles set status='published' where slug='test-artist' and version=1;
do $$ declare affected integer;begin
 update public.artist_profiles set name='Stale' where slug='test-artist' and version=1;get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Stale edit accepted';end if;
 begin delete from public.studio_content_audit;raise exception 'Audit mutable';exception when insufficient_privilege then null;end;
end $$;
reset role;set local role anon;
do $$ begin if(select count(*) from public.artist_profiles)<>5 then raise exception 'Publication failed';end if;end $$;
reset role;set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
update public.artist_profiles set status='archived' where slug='test-artist';
reset role;set local role anon;
do $$ begin if(select count(*) from public.artist_profiles)<>4 then raise exception 'Archive visible';end if;end $$;
rollback;
