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
