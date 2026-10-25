-- Activate only after the production deployment contains the /assets/visualz files.
-- Idempotent: never overwrite owner edits, drafts or archival decisions.
insert into public.visualz_photos(local_path,title,sort_order,status) values
('/assets/visualz/archive-01.webp','THE NORTH MOB / Archive 01',9,'published'),
('/assets/visualz/archive-02.webp','THE NORTH MOB / Archive 02',10,'published'),
('/assets/visualz/archive-03.webp','THE NORTH MOB / Archive 03',11,'published'),
('/assets/visualz/archive-04.webp','THE NORTH MOB / Archive 04',12,'published'),
('/assets/visualz/archive-05.webp','THE NORTH MOB / Archive 05',13,'published'),
('/assets/visualz/archive-06.webp','THE NORTH MOB / Archive 06',14,'published'),
('/assets/visualz/archive-07.webp','THE NORTH MOB / Archive 07',15,'published'),
('/assets/visualz/archive-08.webp','THE NORTH MOB / Archive 08',16,'published'),
('/assets/visualz/archive-09.webp','THE NORTH MOB / Archive 09',17,'published'),
('/assets/visualz/archive-10.webp','THE NORTH MOB / Archive 10',18,'published'),
('/assets/visualz/archive-11.webp','THE NORTH MOB / Archive 11',19,'published'),
('/assets/visualz/archive-12.webp','THE NORTH MOB / Archive 12',20,'published'),
('/assets/visualz/archive-13.webp','THE NORTH MOB / Archive 13',21,'published'),
('/assets/visualz/archive-14.webp','THE NORTH MOB / Archive 14',22,'published'),
('/assets/visualz/archive-15.webp','THE NORTH MOB / Archive 15',23,'published'),
('/assets/visualz/archive-16.webp','THE NORTH MOB / Archive 16',24,'published')
on conflict(local_path) do nothing;
