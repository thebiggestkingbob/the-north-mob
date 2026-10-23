# Approved North Mob visual direction

The owner explicitly approved the cinematic Home revision at `573fe08` on 23 October 2026 and asked to lock it in. Preserve its identity when extending public pages: mostly black/white, the authentic centred logo, small corner navigation, restrained persistent soundtrack, bold condensed editorial typography, deliberate negative space, supplied photography and measured native-scroll transitions. Do not revert to the earlier conventional card/hero layout or introduce unapproved stock imagery, yellow Mustard branding or proprietary reference assets.

The owner's subsequent requested evolution replaces the initial portrait-video-over-photo composition with a viewport-filling background film, and adds dedicated Visualz and Shop chapters on Home. This is an approved change to the composition, not a rollback of the approved visual direction.

## Current extension

- Home now has Film, The Mob, Music, Visualz and Shop chapters. Visualz/Shop have their own substantial scenes and direct links.
- The opening supplied film covers the viewport with `object-fit: cover` and a deliberate upper-body crop. The previous homepage photograph is no longer part of the opening background. The extracted film poster is the fallback. Cover fitting crops the supplied portrait source on wide screens; no new footage or extra resolution is fabricated.
- Visualz and Shop inherit the approved centred logo, corner navigation and compact player. Other public page styling and Studio functionality remain intact.
- Visualz contains the verified official film, supplied silent Mob Ties film, the three existing Instagram reels and nine supplied archive photographs. Film/reel filters and search operate only on this real catalogue. Instagram reels remain verified external links; official YouTube and supplied local film play in-page. Photo search, keyboard/swipe lightbox, Escape and focus return are preserved.
- Shop has a branded editorial empty state, real social link and the existing consent-based signup. Editorial photography is labelled and is not presented as merchandise. There are no invented products, prices, checkout or stock claims. Custom commerce/gateway and actual merchandise remain separate pending work.
- Background footage remains muted, pausable, offscreen/hidden-tab aware, with reduced-motion and save-data still fallbacks. Native scrolling and slow route transitions remain in place. No public production launch is authorized by this review.

## Verification — 23 October 2026

TypeScript, ESLint, 63 unit tests and the production build passed. The complete 54-test browser suite passed. A separate isolated cold-load filter repetition exposed the animated heading intercepting clicks; the library controls now stack above the entry animation, and three fresh-browser repetitions passed after that repair. Gallery controls also remain disabled until hydrated. Existing official-film playback/teardown, local Mob Ties playback, photo search/lightbox, soundtrack persistence, gig records, form boundaries and Studio guards remain covered.

Desktop (1440×1000) and mobile (390×844) Home/Visualz/Shop screenshots were reviewed with no horizontal overflow. Existing seven-page layout checks also cover 320, 375, 768, 1024, 1440 and 1920 pixel widths. Media/provider fixtures do not certify live Spotify/Brevo account availability; no real email, signup, payment or order was sent during testing.
