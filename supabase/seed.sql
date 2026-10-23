-- Approved announcement only. Re-running does not overwrite owner edits.
insert into public.events(legacy_key,name,date,venue,status) values
('2026-10-02-h4b-pop-up','H4B Pop Up','2026-10-02','Ga-Rankuwa, Zone 4','published'),
('2026-10-03-homecoming','Homecoming','2026-10-03','Pretoria Botanical Gardens','published'),
('2026-10-03-mr-bully-tour','Mr Bully Tour','2026-10-03','Orange Farm','published'),
('2026-10-03-splash-party','Splash Party','2026-10-03','Mimakau Community Hall','published'),
('2026-10-10-back-to-the-city-festival','Back to the City Festival','2026-10-10','Mary Fitzgerald Square','published'),
('2026-10-31-young-durag-mansion-party','Young Durag Mansion Party','2026-10-31','Winchester Hills','published'),
('2026-10-31-tazer-bouy-bday-celebration','Tazer Bouy Bday Celebration','2026-10-31','Shalas Cafe','published')
on conflict (legacy_key) do nothing;

-- Approved artist identities and portraits; never overwrite owner edits.
insert into public.artist_profiles(slug,name,tagline,portrait,position,sort_order,status) values
('trophy','Trophy','ICON.','/assets/artists/trophy.webp','43% 65%',0,'published'),
('orieblxckmaestro','Orieblxckmaestro','HERE 4 BUSINESS(H4B).','/assets/artists/orieblxckmaestro.webp','40% 65%',1,'published'),
('carlow-picasso','Carlow Picasso','WELCOME TO THE WORLD OF ART','/assets/artists/carlow-picasso.webp','38% 68%',2,'published'),
('majoricey','MajorIcey','TRAPCARDI PIONEER','/assets/artists/major-icey.webp','35% 64%',3,'published')
on conflict(slug) do nothing;
