# THE NORTH MOB — CODEX MASTER BUILD PROMPT

## Mission
Build a polished, production-oriented, fully responsive, cinematic, motion-led official website for **THE NORTH MOB / THE NORTHMOB**. Implement the **six previously approved screens** faithfully. Their visual compositions, content hierarchy, page names, black-and-white editorial styling, original photography, authentic logo, and aesthetic are LOCKED. Do not redesign, reorganize, add an unapproved page, introduce colors, replace assets with stock/AI images, or place the featured YouTube video on Home. Motion is to enhance the existing screens, not alter them.

**Critical handoff rule:** The source-of-truth approved screen references are in the supplied conversation/design images. Review them and the attached asset bundle before coding. If those exact approved screenshots are not available in your workspace, STOP and ask for them. Do not pretend other mockup images are the approved screens. Audit the repository before editing; if empty, scaffold the app. Explain the plan briefly, then implement, test, and report actual results. Do not claim a production integration is working unless tested.

## Deliverables
- Complete Next.js App Router + TypeScript site if starting fresh; otherwise respect existing framework, structure and conventions.
- Six routes/pages only: **Home, Music, The Mob, Visuals, Live, Business/Contact**. Preserve approved page names and order.
- Fully interactive header, navigation, mobile menu, browser history, page transitions, galleries, music embeds/links, artist detail experiences, event interactions, business enquiry form.
- Shared cinematic motion design system; GSAP + ScrollTrigger for choreographed effects where appropriate. Avoid competing animation systems. Smooth scrolling only if accessible and robust; no scroll hijacking. Respect prefers-reduced-motion.
- Responsive desktop/tablet/mobile, touch and keyboard interactions, performant image/video loading, graceful fallback states, SEO and social previews, sitemap, analytics only with privacy-aware configuration.
- Secure backend delivery for business enquiries using a server-side endpoint and a configurable email provider (no secrets client-side); validation, honeypot/rate limits, explicit success/failure, accessible errors, no fake success.
- Clean typed content data layer and easy-to-update config for artists, media, music, live shows, and booking contact. **Do not add an admin dashboard in this scope**; the user has not approved one.
- README with setup, environment variables, media upload procedure, tests, deploy instructions, and outstanding content checklist.

## Design freeze / visual rules
1. Actual supplied THE NORTH MOB logo is the sole official logo. Three horizontal bars at left with THE / NORTH / MOB® white wordmark on black. Never recreate with a generic NM monogram. Preserve proportions; use provided file as image asset.
2. Authentic supplied black-and-white group and artist photography only. Do not hallucinate identities or synthesize new portraits. Crops can be art-directed but preserve image integrity.
3. Black/white/gray editorial design, oversized strong typography, restrained line work, generous cinematic negative space. No generic cards, gratuitous borders, gradients, decorative UI, or colorful accent.
4. **Home**: keep approved photography, giant headline, navigation and concentric-ring parallax composition. NO featured YouTube embed or new video section on Home.
5. **Music**: approved HERE 4 BUSINESS editorial layout; real music links and verified release details only; do not invent album covers, tracks or release dates.
6. **The Mob**: authentic collective narrative and four verified members; profile reveals and transitions integrated into existing layout.
7. **Visuals**: preserve approved gallery layout; native-feeling video interaction happens here. Do not create a YouTube page or redirect as the primary interaction.
8. **Live**: preserve approved event atmosphere; if there are no verified shows, display a beautiful purposeful empty state and configurable booking link; NEVER invent dates or venues.
9. **Business**: preserve approved BUSINESS IS PERSONAL concept and functional enquiry experience. If booking email not configured, avoid claiming delivery; expose configuration requirement clearly in README and handle frontend appropriately.

## Required motion architecture — every page
- Navigation click triggers coherent exit animation, transition veil/typographic or logo treatment consistent with approved visuals, route change, then new page reveal. Preserve focus, scroll restoration, history navigation and deep linking; do not trap navigation or flash unstyled content.
- Home: layered photographic parallax, approximately 12 subtle concentric SVG rings, pointer/scroll response with restrained amplitudes, headline stagger reveal.
- Music: cover/release reveal, track list stagger, elegant hover/tap interactions, music-player embedding within content hierarchy.
- The Mob: portrait reveal, hover micro-motion, accessible tap/click to expand artist information and return without duplicated images/names.
- Visuals: gallery scroll reveal, poster-to-player expansion, native-feeling modal/lightbox with escape/backdrop/close, focus trap, scroll lock and playback pause on close. If the supplied native file is later added, use a custom HTML5 video player. Until then, use privacy-enhanced YouTube iframe where allowed, embedded **inside the site** with minimal wrapper; be honest that YouTube chrome cannot be fully removed. Instagram embeds may display Instagram UI; provide graceful fallback.
- Live: image reveal, event list stagger, functional ticket buttons only when real URLs exist.
- Business: editorial text reveals, elegant form focus/success/error motion.
- All: reduced-motion alternate experience, low-powered/mobile optimization, animations use transforms/opacity, avoid expensive per-frame layout recalculation, prevent hydration errors and cumulative layout shift.

## Authentic content — use exact sources, do not invent
Collective: **THE NORTHMOB.** Four members named by their official Spotify bio: **Orieblxckmaestro, Trophy, MajorIcey, Carlow Picasso**.

Spotify bio provided by the user (preserve meaning and exact quotes only where needed; proofread visible copy with user):
> The North Mob is not a crew — it’s culture. A relentless collective movement of free creatives functioning at the peak of their individual artistry, unified by sound, vision, and lifestyle. Rooted in street authenticity but engineered for global impact.
>
> In January 2026, The North Mob ignited the internet after teasing “Camp Chair”. The snippet quickly turned into a cultural moment. The momentum culminated in securing a Focalistic feature prior to the song’s official release. Upon release, “Camp Chair” amassed over 1 million streams across all platforms within six months.
>
> Building on that momentum, The North Mob followed up with “Maatla Thata” featuring Lacabra, which surpassed 1 million streams across all platforms in just two months. A major milestone followed when The North Mob performed alongside Focalistic at the Adidas Foca Forum 2000 sneaker launch — a landmark cultural moment, as Focalistic became the first and only African artist to secure an official sneaker collaboration with Adidas.
>
> Sonically, The North Mob draws inspiration from the Bacardi genre and South African legends such as Hugh Masekela, Brenda Fassie, AKA, and Caiphus Semenya, alongside contemporary trailblazers like Focalistic and a wide spectrum of US-based artists.
>
> At its core, The North Mob is a lifestyle — a movement defined by unity, freedom of expression, and fearless creativity.

These are **artist-authored Spotify biography claims**, not independently verified press facts. Attribute appropriately; do not present listener counts or milestone claims as independently audited.

Individual Spotify descriptions from screenshots:
- Trophy: `ICON.`
- Orieblxckmaestro: `HERE 4 BUSINESS(H4B).`
- MajorIcey: `TRAPCARDI PIONEER`
- Carlow Picasso: `WELCOME TO THE WORLD OF ART`

Screenshots also show approximate monthly listeners on 21 October 2026: collective 103,044; Trophy 99,094; Orieblxckmaestro ~89.4K; MajorIcey 80,326; Carlow Picasso 80,320. **Do not display these as live metrics or hard-code a current counter.** Prefer omit entirely unless a properly dated editorial snapshot is approved.

Music titles from user-supplied Spotify bio: `Camp Chair`, `Maatla Thata` (feat. Lacabra). `HERE 4 BUSINESS` appears in the approved Music mockup and member tagline; verify whether it is a release title before attaching an album/tracklist.

## Official links and embeds
- YouTube channel: https://youtube.com/@thenorthmob?si=KiTZ-JJJSOof_mET
- Featured YouTube video for Visuals ONLY: https://youtu.be/on_eg9HLysA?si=34Tcivg9PioRaVeY (ID `on_eg9HLysA`)
- Spotify collective: https://open.spotify.com/artist/0iZ4kkTa0bDsMz9Qgrr0zx
- Four additional supplied artist Spotify profiles (do not guess ID-to-member mapping; confirm with artist page metadata or screenshots):
  - https://open.spotify.com/artist/65vyqjRCxzXjN1TQ3wxoH2
  - https://open.spotify.com/artist/3D1v2h1bVnBVHAx1iSocJq
  - https://open.spotify.com/artist/4VoY4qXMbV8nRrMYagmJWs
  - https://open.spotify.com/artist/1fBoGGZkTvoMMUD90ZV5kj
- Instagram profile: https://www.instagram.com/thenorthmob_/
- Three supplied Reels to integrate in Visuals where embed allowed:
  - https://www.instagram.com/reel/DZega7riPDk/
  - https://www.instagram.com/reel/Del2jMPiAWz/
  - https://www.instagram.com/reel/DcSskUDiPHs/
- Spotify embedded players are third-party widgets; test embedding permissions. Do not pretend to have an unbranded custom Spotify player. For a truly custom visual/player experience use original licensed audio/video assets later.

## Media asset mapping
Use assets from `assets/` in the accompanying ZIP; see `ASSET_MANIFEST.md`. Originals must remain intact. Prefer responsive WebP/AVIF derivatives for delivery; retain original sources. The supplied screenshots are CONTENT EVIDENCE, not a license to use app UI screenshots as the site's artist photographs. Extracted Spotify portrait images must not be used without rights/approval; use the user's actual photos instead.

## Content model and integration requirements
- Typed records for artist {name, bio, tagline, spotifyUrl, approvedPortrait, socialLinks}; release {title, artist, cover, spotifyUrl, date?}; visual {title?, provider, embedUrl, poster, nativeVideoUrl?}; event {date, venue, city, ticketUrl, status}; contact {bookingEmail?, socialLinks}.
- Where mapping is uncertain, mark TODO in data, keep visible UI polished and avoid misattribution. Do not fabricate biographies beyond supplied material.
- Optional native video URL configuration should automatically upgrade the Visuals player from YouTube iframe to branded HTML5 player when uploaded. Video file must be delivered via suitable video CDN/storage, not committed as a giant asset to git. Add captions/poster support and playback controls.
- Contact form should use a tested email provider adapter and env variables; no mail credentials in repository. Include clear not-configured behavior in non-production and deployment readiness checks.
- Only link out when unavoidable; embedded video experience must remain within Visuals page where provider permits.

## Accessibility, performance, security and quality gates
- Semantic HTML, keyboard accessibility, focus management, screen reader labels, sufficient contrast, visible focus states, WCAG AA targets where feasible.
- Responsive and touch testing at 320px, 375px, 768px, 1024px, 1440px, 1920px.
- Lighthouse-oriented performance: optimized image loading, lazy media, poster-first videos, reserve aspect ratios, avoid layout shift, route splitting, animation cleanup on unmount, no excessive JS or autoplay audio.
- Security: input validation server-side, request throttling, bot protection, secrets only on server, CSP tailored to Spotify/YouTube/Instagram embeds, POPIA-conscious form copy and minimal retention.
- Tests: lint, typecheck, build, component/unit tests for content and form validation, Playwright end-to-end route/navigation/modal/form states, reduced-motion and mobile smoke tests. Test YouTube and Instagram behavior in real browser; clearly disclose provider restrictions.
- SEO: metadata per route, OG images from authorized photography, canonical URLs, sitemap, robots, descriptive alt text.
- Deployment: Vercel-ready, no fake integrations, environment variable example, clear checklist of missing production settings.

## Execution sequence
1. Inspect current repository, supplied approved screen references, and assets. Identify gaps. Do not modify visual design.
2. Set up site, routes, assets and typed content config.
3. Reproduce all six approved screens precisely; compare screenshot-by-screenshot at desktop and mobile.
4. Add the shared motion system and page-specific choreography to every page.
5. Integrate Spotify, YouTube (Visuals only), Instagram fallbacks and native-video upgrade path.
6. Implement accessible profile interactions, event states, real contact delivery adapter and security protections.
7. Run build, lint, typecheck, e2e tests, inspect mobile layouts, fix errors and animation leaks.
8. Return a concise report: what is implemented, what is verified in browser, what depends on credentials/provider permissions, what content remains outstanding, and exact deployment steps.

## Non-negotiable acceptance criteria
- Approved six screens are recognizable and unchanged in layout, names, hierarchy and look.
- Every page has polished entrance/exit and scroll/interactivity motion; reduced-motion users get a complete experience.
- Home has NO featured video or new video section.
- Visuals has seamless in-page playback, graceful third-party restrictions, and native player upgrade path.
- All official logos and photography are authentic supplied assets.
- Four member names and collective story are accurate to screenshots; no invented tracks, events, bios or live statistics.
- All buttons, menus, profiles, media overlays, forms and navigation either work or are visibly and safely disabled until configured.
- No unnecessary admin dashboard, fake backend or misleading claims of launch readiness.
