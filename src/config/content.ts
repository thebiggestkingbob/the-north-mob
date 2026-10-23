export const bookingEmail = "thebiggest.kingbob@gmail.com";
export const spotifyArtistUri = "spotify:artist:0iZ4kkTa0bDsMz9Qgrr0zx";
export const links = {
  spotify: "https://open.spotify.com/artist/0iZ4kkTa0bDsMz9Qgrr0zx",
  youtube: "https://youtube.com/@thenorthmob",
  instagram: "https://www.instagram.com/thenorthmob_/",
} as const;

// Names map to the filenames supplied by the owner, not faces in the mockup.
export const artists = [
  { slug: "trophy", name: "Trophy", tagline: "ICON.", portrait: "/assets/artists/trophy.webp", position: "43% 65%" },
  { slug: "orieblxckmaestro", name: "Orieblxckmaestro", tagline: "HERE 4 BUSINESS(H4B).", portrait: "/assets/artists/orieblxckmaestro.webp", position: "40% 65%" },
  { slug: "carlow-picasso", name: "Carlow Picasso", tagline: "WELCOME TO THE WORLD OF ART", portrait: "/assets/artists/carlow-picasso.webp", position: "38% 68%" },
  { slug: "majoricey", name: "MajorIcey", tagline: "TRAPCARDI PIONEER", portrait: "/assets/artists/major-icey.webp", position: "35% 64%" },
] as const;

// Supplied Spotify biography is artist-authored. No invented tracklist or dates.
export const collectiveBio = "The North Mob is not a crew — it’s culture. A relentless collective movement of free creatives functioning at the peak of their individual artistry, unified by sound, vision, and lifestyle. Rooted in street authenticity but engineered for global impact.";


export type LiveEvent = { date: string; name: string; venue: string; ticketUrl?: string };
export const events: LiveEvent[] = [
  { date: "2026-10-02", name: "H4B Pop Up", venue: "Ga-Rankuwa, Zone 4" },
  { date: "2026-10-03", name: "Homecoming", venue: "Pretoria Botanical Gardens" },
  { date: "2026-10-03", name: "Mr Bully Tour", venue: "Orange Farm" },
  { date: "2026-10-03", name: "Splash Party", venue: "Mimakau Community Hall" },
  { date: "2026-10-10", name: "Back to the City Festival", venue: "Mary Fitzgerald Square" },
  { date: "2026-10-31", name: "Young Durag Mansion Party", venue: "Winchester Hills" },
  { date: "2026-10-31", name: "Tazer Bouy Bday Celebration", venue: "Shalas Cafe" },
];
