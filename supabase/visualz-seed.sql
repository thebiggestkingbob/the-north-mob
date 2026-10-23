-- Idempotent approved Visualz content; never overwrite owner changes.
insert into public.visualz_videos(youtube_id,sort_order,status) values
('s3Y4eAtF8jw',0,'published'),
('UzOfwM3Ea6A',1,'published'),
('XtGEewRFFC4',2,'published'),
('GAI2cugbQgI',3,'published'),
('on_eg9HLysA',4,'published'),
('3ClPThAQawM',5,'published')
on conflict(youtube_id) do nothing;
insert into public.visualz_photos(local_path,title,sort_order,status) values
('/assets/mob-ties/mob-ties-05.webp','Mob Ties / Photograph 05',0,'published'),
('/assets/mob-ties/mob-ties-09.webp','Mob Ties / Photograph 09',1,'published'),
('/assets/mob-ties/mob-ties-11.webp','Mob Ties / Photograph 11',2,'published'),
('/assets/mob-ties/mob-ties-13.webp','Mob Ties / Photograph 13',3,'published'),
('/assets/mob-ties/mob-ties-22.webp','Mob Ties / Photograph 22',4,'published'),
('/assets/mob-ties/mob-ties-26.webp','Mob Ties / Photograph 26',5,'published'),
('/assets/mob-ties/mob-ties-30.webp','Mob Ties / Photograph 30',6,'published'),
('/assets/mob-ties/mob-ties-31.webp','Mob Ties / Photograph 31',7,'published'),
('/assets/mob-ties/mob-ties-32.webp','Mob Ties / Photograph 32',8,'published')
on conflict(local_path) do nothing;
