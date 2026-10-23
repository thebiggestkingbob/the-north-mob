# Homepage visual correction — review before extending to other chapters

The user rejected the prior interpretation as visually too far from the supplied Mustard reference. This revision addresses the Home composition and shared shell styling on Home only. It retains the existing feature branch, public routes, music engine and backend work. Production is not changed.

## Reference review and resulting decisions

Revisited all supplied screenshots, including the duplicate, the five extracted frames, and the recording's full 0–59 second timeline sampled every half-second. Observed the persistent centred identity/corner navigation, dark canvas, film/image scale changes, slow scene progression, large editorial words and overlapping photography/album compositions. These are visual observations, not a claim to have recovered proprietary source code or exact easing/scroll triggers.

- Opening imagery at 0–12s and 18–32s informs the film-led opening and fixed perimeter navigation.
- Large editorial typography at 14–18s informs the scale contrast of the second scene; North Mob's existing “Real sounds. Bigger impacts.” copy is used.
- Image/type juxtapositions at 33–46s and the staggered photographic/album compositions at 48–59s inform the shift from collective imagery into H4B.
- North Mob retains monochrome branding, its authentic logo and approved assets. No Mustard images, recording, logo, copy, stock or private reference assets are shipped.

## Implemented experience

1. Silent supplied Mob Ties film, with its portrait composition intact on desktop and phones; dim approved Home group photograph behind it, centred official logo and corner navigation.
2. Native vertical scrolling moves into an editorial “REAL SOUNDS.” composition with supplied courtyard photography, subtle opposing text/image movement and the existing Mob link.
3. Official H4B artwork and title enter as the next scene, with links to Music and all remaining public chapters. Album art remains fully contained.

The intro uses a short aperture reveal; scene motion follows native document scrolling using GSAP transforms and CSS sticky positioning. There is no wheel interception, fake loading count, forced entry gate, giant North Mob title, expanded global player or public reference imagery. Existing slow route wipes remain intact.

The persistent Spotify engine/queue is unchanged. Native Spotify/browser playback restrictions still apply. The film is silent, has its own pause/play control, pauses offscreen/in hidden tabs and falls back to a real extracted poster if playback fails. Reduced-motion and save-data modes do not download or play the film. Reduced-motion mode removes sticky animation and keeps all scenes/links available.

## Review boundary

The other public pages and Studio are preserved for this review. Extending this visual direction across them follows the user's homepage review. The existing dedicated-Supabase activation blocker is unchanged and unrelated to this visual correction.

## Verification — 23 October 2026

TypeScript, ESLint, 63 unit tests, the production build and all 50 Playwright browser tests passed. The added checks cover centred desktop branding, intact portrait aspect ratio, real muted film playback, pause/resume, offscreen stopping, reduced-motion scenes/navigation and save-data no-download behavior. The existing seven-page viewport, music persistence/recovery, form, gig and Studio boundary regressions passed.

Desktop (1440×1000) and mobile (390×844) scene screenshots were inspected; no horizontal overflow was found. A separate browser smoke check confirmed the film and controls on desktop, while reduced-motion screenshots used the extracted still. Initial screenshot captures were repeated after image decoding/paint for a settled visual review. Production and `main` remain unchanged; this is a protected feature-branch preview.
