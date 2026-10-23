# Stage 2 — public frontend implementation

Feature branch: `feature/north-mob-cinematic-platform`. Production/main untouched.

Implemented seven public chapters, restrained shared navigation, image-led Home with the approved still and a silent mobile film candidate, persistent compact Spotify controls, event-driven progress/seek, searchable photo archive with keyboard/swipe lightbox, adaptive enquiry fields passed to existing server/email fallback paths, and a Shop empty state.

Official artwork, verified catalogue, named artist portraits/profile interactions, seven exact gig records, slow route wipe, consent-based newsletter and existing Brevo delivery remain in place. Unknown track IDs use verified external Spotify links rather than opening an expanded album player. Native Spotify controls remain available when browser/provider interaction is required. Playback is only labelled playing after provider confirmation; progress appears only after real duration/position reports.

Only first-party assets were copied. See `stage-2-assets.json` for hashes/source mapping. Private inspiration/reference material has not been added to the app.

Not a completed platform launch: Studio/auth/database, commerce provisioning/products/payments, operational consent/storage/rate limiting, protected staging and integrated real-device/provider QA remain later stages. There are no invented products or transactions. Brevo tests use fixtures; no test email or subscription was sent. Live key/sender delivery verification remains necessary in the configured environment. Spotify tests use a controlled SDK fixture and cannot certify full tracks, account entitlements or unprompted audible autoplay.

The portrait film is silent, mobile-only, paused offscreen/in hidden tabs, and disabled for reduced-motion/save-data preferences. Desktop uses the approved photograph until landscape footage is approved. No public deployment or production push was made.

## Verification — 23 October 2026

- TypeScript and ESLint passed.
- 33 unit tests passed.
- Next.js production build passed, including all seven public routes.
- 45 Chromium browser tests passed against that production build: six viewport widths, navigation/focus/dialogs, exact gig data/status, consent forms/fallback, persistent queue and recovery, provider progress/seek and gallery search/navigation.
- Desktop/mobile screenshots captured under `work/screenshots/`; Home mobile and Business desktop visually inspected.
- `git diff --check` passed. Original main remains clean at `5746532`.
- Browser provider fixtures do not substitute for live Spotify/Brevo or physical-device verification.
