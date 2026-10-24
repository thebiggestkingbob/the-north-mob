export type CatalogueTrack = { id: string; title: string; artist: string; credits: string; duration: string; uri?: string; releaseId: string; source: string; cover?: string };
export const album = {
  id: "here-4-business", title: "HERE 4 BUSINESS (with Carlow Picasso)",
  uri: "spotify:album:3f1HZdfe4bPLqQOu5sfmvO", source: "https://open.spotify.com/album/3f1HZdfe4bPLqQOu5sfmvO",
  cover: "/assets/h4b-album-cover.jpg",
  artist: "THE NORTHMOB.", type: "Album", year: "2026",
} as const;
const group = "THE NORTHMOB., Trophy, Orieblxckmaestro, MajorIcey, Carlow Picasso";
const listing = [
  ["peke , fosholo", "03:02", group, ""],
  ["momma , phone", "04:17", "THE NORTHMOB., Lowfeye, Trophy, Orieblxckmaestro, MajorIcey, Carlow Picasso", "0uOQ2hUkWqG7Mk38yQpYt9"],
  ["cut , box", "02:26", group, ""],
  ["sjepa", "03:01", "THE NORTHMOB., Young Stunna, Trophy, Orieblxckmaestro, MajorIcey, Carlow Picasso", "3F9op8u11jyr1OGLyEIwDW"],
  ["peaky , blinder", "03:16", group, "6DiWTgc5snndkCPs2ohJwN"],
  ["highway , dimas", "03:07", group, ""],
  ["gerr , ten", "03:36", "THE NORTHMOB., Focalistic, Orieblxckmaestro, Trophy, Carlow Picasso, MajorIcey", "2Y8PzKNQSqbhursel7lSq8"],
  ["ten , toes", "03:44", "THE NORTHMOB., Blxckie, Trophy, MajorIcey, Carlow Picasso, Orieblxckmaestro, Loatinover Pounds", "0DDcHNwB311alxJsMCEthU"],
  ["often [with Carlow Piccaso)", "03:12", "THE NORTHMOB., Trophy, Orieblxckmaestro, MajorIcey", ""],
  ["camp , chair", "03:17", "THE NORTHMOB., Trophy, Orieblxckmaestro, Focalistic, MajorIcey, Carlow Picasso", "0qmPvb3cGQpSN5chcx6djF"],
  ["maatla , thata", "02:39", "THE NORTHMOB., Orieblxckmaestro, Trophy, MajorIcey, Carlow Picasso, LaCabra", "3HdLERcMc38Yq5UDnCFGf3"],
];
export const catalogue: CatalogueTrack[] = listing.map(([title, duration, credits, id], index) => ({
  id: `h4b-${index + 1}`, title, duration, credits, artist: album.artist, releaseId: album.id,
  ...(id ? { uri: `spotify:track:${id}` } : {}), source: id ? `https://open.spotify.com/track/${id}` : album.source,
}));
export const additionalTracks: CatalogueTrack[] = [
  { id: "tatana-mathata", title: "tatana, mathata.", duration: "02:33", artist: "Trophy, Orieblxckmaestro, Carlow Picasso, MajorIcey", credits: "Trophy, Orieblxckmaestro, Carlow Picasso, MajorIcey", uri: "spotify:track:6VwibeE8WERPrdtq9zPF75", releaseId: "tatana-mathata", source: "https://open.spotify.com/track/6VwibeE8WERPrdtq9zPF75" },
  { id: "fetlhela", title: "Fetlhela (feat. Trophy, Orielblxckmaestro, Majoricey & Carlow Picasso)", duration: "03:42", artist: "Loatinover Pounds, THE NORTHMOB.", credits: "Loatinover Pounds, THE NORTHMOB., Trophy, Orielblxckmaestro, MajorIcey, Carlow Picasso", releaseId: "ground-2-glory", source: "https://open.spotify.com/album/10upZ9wALA9z8ByE3nZTHk" },
];
export const allTracks = [...catalogue, ...additionalTracks];
export const openingTrack = catalogue[9];
