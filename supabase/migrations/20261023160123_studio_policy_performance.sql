begin;
create index studio_audit_actor on public.studio_audit_events(actor_id);
create index studio_content_audit_actor on public.studio_content_audit(actor_id);
alter policy public_events on public.events to anon;
alter policy owner_events_read on public.events using ((select studio_private.is_owner()) or status='published');
alter policy published_artists on public.artist_profiles to anon;
alter policy owner_artists_read on public.artist_profiles using ((select studio_private.is_owner()) or status='published');
alter policy published_read on public.visualz_videos to anon;
alter policy owner_read on public.visualz_videos using ((select studio_private.is_owner()) or status='published');
alter policy published_read on public.visualz_photos to anon;
alter policy owner_read on public.visualz_photos using ((select studio_private.is_owner()) or status='published');
alter policy published_read on public.music_releases to anon;
alter policy owner_read on public.music_releases using ((select studio_private.is_owner()) or status='published');
alter policy published_read on public.music_tracks to anon;
alter policy owner_read on public.music_tracks using ((select studio_private.is_owner()) or (status='published' and exists(select 1 from public.music_releases r where r.slug=music_tracks.release_slug and r.status='published')));
-- Owner reads already include derivatives. Public delivery routes use the anon role.
alter policy published_image_read on storage.objects to anon;
commit;
