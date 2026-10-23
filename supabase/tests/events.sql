\set ON_ERROR_STOP on
begin;
insert into public.staff_members(user_id) values ('00000000-0000-4000-8000-000000000001');
-- Authenticated owner can create private drafts and receive a new immutable revision.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
insert into public.events(id,name,date,venue,status) values ('10000000-0000-4000-8000-000000000001','Local test event','2026-11-01','Test venue','draft');
do $$ begin
 if (select count(*) from public.events) <> 8 then raise exception 'Owner cannot see drafts'; end if;
 if (select count(*) from public.studio_audit_events where event_id = '10000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Missing atomic audit row'; end if;
end $$;
-- Anonymous visitors see the seven exact seeded events, no drafts or private tables.
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from public.events) <> 7 then raise exception 'Public draft leak'; end if;
 if (select count(*) from public.events where date = '2026-10-03') <> 3 then raise exception 'Same-day gigs lost'; end if;
 begin perform * from public.staff_members; raise exception 'Membership exposed'; exception when insufficient_privilege then null; end;
 begin perform * from public.studio_audit_events; raise exception 'Audit exposed'; exception when insufficient_privilege then null; end;
 begin insert into public.events(name,date,venue) values ('Unauthorized','2026-11-01','Test venue'); raise exception 'Anonymous write succeeded'; exception when insufficient_privilege then null; end;
end $$;
-- A signed-in non-owner cannot promote themself or edit content.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ declare affected integer; begin
 if (select count(*) from public.events) <> 7 then raise exception 'Non-owner draft leak'; end if;
 update public.events set name = 'Unauthorized'; get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Non-owner update succeeded'; end if;
 begin insert into public.staff_members(user_id) values ('00000000-0000-4000-8000-000000000002'); raise exception 'Self-promotion succeeded'; exception when insufficient_privilege then null; end;
 begin insert into public.events(name,date,venue) values ('Unauthorized','2026-11-01','Test venue'); raise exception 'Non-owner write succeeded'; exception when insufficient_privilege then null; end;
end $$;
-- Publish is visible, versioned, audited; stale updates cannot overwrite it.
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
update public.events set status = 'published' where id = '10000000-0000-4000-8000-000000000001' and version = 1;
do $$ declare affected integer; begin
 if (select version from public.events where id = '10000000-0000-4000-8000-000000000001') <> 2 then raise exception 'Version not incremented'; end if;
 update public.events set name = 'Stale update' where id = '10000000-0000-4000-8000-000000000001' and version = 1; get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Stale overwrite succeeded'; end if;
 begin delete from public.studio_audit_events; raise exception 'History deletion succeeded'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin if (select count(*) from public.events) <> 8 then raise exception 'Published event not visible'; end if; end $$;
-- Archive hides the event. Revoked ownership takes effect for an existing user ID.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
update public.events set status = 'archived' where id = '10000000-0000-4000-8000-000000000001';
reset role;
update public.staff_members set active = false where user_id = '00000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ declare affected integer; begin
 if (select count(*) from public.events) <> 7 then raise exception 'Revoked owner sees private data'; end if;
 update public.events set status = 'published' where id = '10000000-0000-4000-8000-000000000001'; get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Revocation did not apply'; end if;
end $$;
reset role;
-- Every app table has RLS. No public/anonymous execute on definer functions.
do $$ begin
 if exists(select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) then raise exception 'Missing RLS'; end if;
 if has_function_privilege('anon','studio_private.audit_event()','execute') then raise exception 'Definer executable by anon'; end if;
end $$;
rollback;
select 'Studio database security and publish tests passed' as result;
