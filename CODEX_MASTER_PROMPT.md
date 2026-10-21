# THE NORTH MOB — CODEX MASTER BUILD INSTRUCTIONS

## Mission and non-negotiables
Build a production-quality cinematic music collective website from the **approved six-screen visual design**. This is implementation, not an invitation to redesign. Preserve approved exact layout, visual hierarchy, page sequence, black-and-white editorial identity, oversized bold typography, minimal chrome, navigation and use of the authentic logo and supplied imagery. **Do not use synthetic artist photos, stock photography, invented credentials, fabricated song titles, live dates, events, quotes or biographies.** Obtain the asset ZIP from the project owner (previously supplied as THE_NORTH_MOB_CODEX_BUILD_PACKAGE.zip), read its detailed CODEX_MASTER_PROMPT.md and ASSET_MANIFEST.md, and use that version as primary source where it adds detail. Review approved screen references before recreating them; if a reference is missing, flag it rather than improvise visual design.

## Six locked pages
1. **Home**: approved cinematic photographic landing hero, THE NORTH MOB branding, exactly the original parallax motif with twelve subtle concentric rings and pointer/scroll-responsive depth. Keep the approved composition. **Do not add the YouTube video or a new video feature to Home.**
2. **Music**: authentic collective release information, verified metadata, album artwork, links to music platforms, embedded Spotify players where available. Distinguish the release *HERE 4 BUSINESS* from song titles and never invent a tracklist.
3. **The Mob**: four confirmed member profiles, Trophy, Orieblxckmaestro, MajorIcey, Carlow Picasso, with authentic supplied portraits and biographies; clicking an artist should open an animated expanded profile within the site and preserve browser history/back behavior.
4. **Visuals**: cinematic in-page video gallery incorporating official YouTube video `on_eg9HLysA` and three referenced Instagram reels, plus supplied images. YouTube iframe must stay **inside** the Visuals page; hide it behind a custom poster and elegant overlay, acknowledging YouTube UI cannot fully be removed. Prepare a native, self-hosted video component for the original video file when supplied; do not scrape/download YouTube or Instagram videos. Respect autoplay restrictions and permission failures.
5. **Live**: approved look with real event entries only. In the absence of confirmed event data, show thoughtful no-upcoming-dates state rather than fictional dates.
6. **Business**: approved editorial contact/booking layout. Implement validated, rate-limited, spam-resistant server-side enquiry form, delivery integration configured via environment variables, meaningful loading/success/error feedback. No fake sent confirmation without delivery. Do not invent contact addresses.

## Authentic identity
Official brand name: THE NORTH MOB (artist Spotify profile stylizes THE NORTHMOB). Use supplied actual white-on-black mark with three thick bars and stacked THE / NORTH / MOB® lettering. Do not recreate as an NM monogram.

Collective official supplied Spotify biography (transcribe exact body text from original Spotify screenshot): the group is described as a creative collective combining music, vision and lifestyle; members Orieblxckmaestro, Trophy, MajorIcey, Carlow Picasso; accounts of Camp Chair, Maatla Thata and influences. Accurately quote only verified artist-provided content. Short Spotify self-descriptions: Trophy — "ICON."; Orieblxckmaestro — "HERE 4 BUSINESS(H4B)."; MajorIcey — "TRAPCARDI PIONEER"; Carlow Picasso — "WELCOME TO THE WORLD OF ART". Do not show screenshot monthly-listener numbers as live counters.

## Official reference links
Collective: https://open.spotify.com/artist/0iZ4kkTa0bDsMz9Qgrr0zx
Additional four artist profiles, to match against screenshots before labeling:
- https://open.spotify.com/artist/65vyqjRCxzXjN1TQ3wxoH2
- https://open.spotify.com/artist/3D1v2h1bVnBVHAx1iSocJq
- https://open.spotify.com/artist/4VoY4qXMbV8nRrMYagmJWs
- https://open.spotify.com/artist/1fBoGGZkTvoMMUD90ZV5kj
YouTube: https://youtube.com/@thenorthmob
Featured film: https://youtu.be/on_eg9HLysA
Instagram account: https://www.instagram.com/thenorthmob_/
Reel URLs:
- https://www.instagram.com/reel/DZega7riPDk/
- https://www.instagram.com/reel/Del2jMPiAWz/
- https://www.instagram.com/reel/DcSskUDiPHs/

## Motion on EVERY page — crucial
Treat the whole site as one choreographed motion website. Shared page transition manager with exit animation, intermediate brand-led wipe/fade and new page reveal; no abrupt hard cuts or flicker. Use GSAP with ScrollTrigger and/or well-maintained React transition utilities. Scroll-linked depth, subtle pointer parallax, typography reveals, staggered item entrances, image masks/crops, hover and focus motion, contextual artist detail expand/collapse, video overlay expand/collapse, mobile navigation animation. Keep all motion purposeful, performance-friendly, and cohesive with the originally approved parallax reference. Respect prefers-reduced-motion, keyboard access and mobile resources. Avoid layout thrashing, giant downloaded JS packages and animation-induced scroll trapping. Ensure back/forward navigation works.

## Build architecture and functionality
Inspect the repository first; if it contains no existing app, initialize a stable TypeScript React/Next.js App Router project with a sane maintainable structure, component library only if compatible with approved visuals, responsive image handling, accessible semantics, composable data layer for artists/releases/events/video/contact, and environment example. Use original uploaded logo/photos directly. Implement real navigation, music platform URLs, authorized platform embeds with fallback, full keyboard and pointer interactions, form validation, accessible error feedback, 404 and loading states, semantic metadata and share cards, sitemap, image alt text and reasonable POPIA-aware privacy disclosure. No unrequested admin dashboard or CMS. Keep actual content in editable local configuration/data modules until further notice.

## Testing and acceptance
Run dependency install, TypeScript checks, lint, tests and production build. Smoke-test all six pages at desktop/tablet/mobile; validate links, navigation including browser back, reduced motion, media embeds/fallbacks, contact flow (with test credentials where needed), video modal close/Escape/focus return, mobile menu, visual regressions and Core Web Vitals. Never claim a third-party player or form works if not actually verified. Publish a short implementation report: files changed; what is fully working; what needs original video/contact email/domain/verified dates/credentials; test results and deployment instructions. Do not deploy publicly until owner approval.

## Priorities
1. Inspect design assets and content/screenshots, preserve design fidelity.
2. Scaffold the project if empty.
3. Implement all six pages and global motion system.
4. Integrate real content and authorized streaming embeds.
5. Make contact genuinely functional once credentials are supplied.
6. Test thoroughly, fix issues and report status.
