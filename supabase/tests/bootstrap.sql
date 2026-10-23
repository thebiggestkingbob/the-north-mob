-- LOCAL TEST HARNESS ONLY: minimal Supabase role/auth contract for PostgreSQL.
-- Never apply this file to a hosted Supabase project.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
insert into auth.users values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');

-- Minimal Storage policy contract for local SQL checks; hosted API behavior is tested separately.
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon,authenticated;
grant select,insert,update,delete on storage.objects to anon,authenticated;

-- Hosted Supabase creates this event-trigger function; exercise the tracked grant correction.
create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$ begin return; end $$;
