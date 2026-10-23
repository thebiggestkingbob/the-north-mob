# H4B Music enhancement

Scope: additive changes to `/music` only. All four pasted briefs have identical SHA-256 `1db26a64e1df0c01ca7c64ce2512c131b4df6927911d38b8ad43b51cb61ea7a3`.

- Added the supplied heading and TRAPCARDI description beside the existing album artwork.
- Added a restrained text strip: **6M+ — Reported first-month streams**, **11 — Tracks**, **2026 — Release year**. The 6M+ milestone comes from the owner's brief; it is not an independently verified or live streaming total. Track count and year use the existing catalogue.
- Added six original featured-artist images, intact, with visible names. Desktop shows one row; tablet/mobile use native horizontal scrolling with keyboard focus and scroll snapping. No gallery JS, extra player, arrows, biography or animation added.

## Asset and credit verification

The names below are printed on the supplied cards; mapping does not rely on recognizing faces. The six supplied images match the private handover's first-party artwork. Optimized WebP files are copied without modification into `public/assets/h4b-features/`; originals remain unchanged.

| Artist | Supplied asset | Existing H4B credit |
| --- | --- | --- |
| Focalistic | mob-ties-14 | gerr , ten; camp , chair |
| Young Stunna | mob-ties-10 | sjepa |
| Blxckie | mob-ties-12 | ten , toes |
| Loatinover Pounds | mob-ties-03 | ten , toes |
| LaCabra | mob-ties-04 | maatla , thata |
| Lowfeye | mob-ties-08 | momma , phone |

No required image is missing. The complete H4B card designs are retained, including their original paper tones; no new UI accent colour is introduced.

## Components

`src/app/music/page.tsx`: existing server page extended in place.
`src/app/music/music.css`: Music-scoped additions.
`src/config/h4b-features.ts`: verified artwork/credit mapping.

The album artwork, catalogue metadata/order, `SpotifyTrackList`, `SpotifyPlayer`, root `SoundtrackProvider`, iframe bridge, transport controls, navigation and unrelated public/backend routes are unchanged.

## Verification

TypeScript, ESLint, production build and all 75 existing unit tests passed. All 24 player browser regressions and three new responsive browser checks passed (27 focused browser tests total). The checks cover 1440px desktop, 834px tablet and 390px mobile layouts, loaded images, keyboard horizontal scrolling, no document overflow, all 11 album tracks and player selection/navigation/recovery/persistence. Screenshots were reviewed after page readiness and reveal animations settled. SHA-256 checks confirm all six copied images exactly match the supplied optimized files; all mapped collaborator names match exact existing track credits.

The first artwork run briefly matched two DOM elements; the assertion now waits for a single rendered artwork before inspecting it. New screenshot checks wait for the existing player and page to settle. No player implementation change was needed. Spotify tests use the established provider fixture: they establish player lifecycle, controls and routing behavior, not real Spotify audio availability. Physical iOS/Android and live provider verification remain separate acceptance checks.
