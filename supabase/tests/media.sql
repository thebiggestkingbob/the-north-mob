-- Disposable records inside a rolled-back transaction.
begin;
insert into public.staff_members(user_id,role,active) values ('00000000-0000-4000-8000-000000000001','owner',true) on conflict(user_id) do update set active=true;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
insert into public.media_assets(id,title,alt,rights,original_path,derivative_path,width,height,byte_size,status) values
('00000000-0000-4000-8000-000000000010','Private photo','Private image description','Owned by test fixture','00000000-0000-4000-8000-000000000010/original','00000000-0000-4000-8000-000000000010/image.webp',100,100,100,'draft');
insert into storage.objects(bucket_id,name) values ('studio-originals','00000000-0000-4000-8000-000000000010/original'),('studio-images','00000000-0000-4000-8000-000000000010/image.webp');
insert into public.visualz_videos(id,youtube_id,title,status) values ('00000000-0000-4000-8000-000000000011','abcdefghijk','Private fixture','draft');
reset role;
set local role anon;
do $$ begin
 if (select count(*) from public.media_assets where id='00000000-0000-4000-8000-000000000010')<>0 then raise exception 'Private media leaked'; end if;
 if exists(select 1 from storage.objects where name like '00000000-0000-4000-8000-000000000010/%') then raise exception 'Private image leaked'; end if;
 if exists(select 1 from public.visualz_videos where id='00000000-0000-4000-8000-000000000011') then raise exception 'Draft video leaked'; end if;
 if has_column_privilege('anon','public.media_assets','rights','select') then raise exception 'Rights information exposed'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
update public.media_assets set status='published' where id='00000000-0000-4000-8000-000000000010' and version=1;
update public.visualz_videos set status='published' where id='00000000-0000-4000-8000-000000000011';
do $$ begin
 if (select version from public.media_assets where id='00000000-0000-4000-8000-000000000010')<>2 then raise exception 'Version not incremented'; end if;
 if (select count(*) from public.studio_content_audit where record_id='00000000-0000-4000-8000-000000000010')<>2 then raise exception 'Atomic audit missing'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 if not exists(select 1 from public.media_assets where id='00000000-0000-4000-8000-000000000010') then raise exception 'Published image missing'; end if;
 if (select count(*) from storage.objects where name like '00000000-0000-4000-8000-000000000010/%')<>1 then raise exception 'Original exposed or derivative missing'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ begin
 begin
 insert into public.visualz_videos(youtube_id,title) values ('12345678901','Unauthorized');
 raise exception 'Non-owner write allowed';
 exception when insufficient_privilege then null; end;
 if exists(select 1 from public.studio_content_audit where record_id='00000000-0000-4000-8000-000000000010') then raise exception 'Private audit leaked'; end if;
end $$;
reset role;
rollback;
