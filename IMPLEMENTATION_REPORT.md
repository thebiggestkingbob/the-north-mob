# Implementation report

## Scope

Built the six pages in the owner-supplied reference, using the four newly uploaded
artist WebPs and the existing official logo/group photographs. Implemented shared
GSAP entrance/exit transitions, Home's twelve rings and pointer/scroll parallax,
artist overlays with history, mobile navigation, poster-to-video dialog, optional
native video, Spotify consent/fallback and Instagram reel fallback links.

Added editable typed content, metadata, sitemap/robots, 404/loading/error states,
local fonts, responsive styling, enquiry validation/delivery adapter boundary,
honeypot, request limits, throttling and deployment environment documentation.
Original prompts and manifests were preserved. No remote push or deployment.

The mockup's sample tracks/durations, live dates, release artwork/year and guessed
member role descriptions were not treated as authentic content. Artist mappings
follow owner-provided filenames, which differ from the reference's face labels.
The official supplied logo replaces the mockup's NM placeholder.

## Verification

- Dependency installation: passed, including local font packages.
- TypeScript: passed, including the production build's type check.
- ESLint and Git whitespace checks: passed.
- Vitest: 14 tests passed (validation, origin, size, throttling and delivery boundary).
- Production build: passed; six page routes plus API, sitemap, robots and error fallback.
- Playwright/Chromium: 14 checks passed. Each of six pages was checked at 320,
  375, 768, 1024, 1440 and 1920 pixels with no horizontal overflow or page errors.
- Checked navigation/back/focus, profile Escape/back/forward, menu keyboard access,
  reduced motion, twelve rings, no Home player and unconfigured enquiry behavior.
- Captured and inspected desktop/mobile screenshots; fixed tablet Music overflow
  and adjusted Home/Live photography to preserve foreground faces.

Build subprocesses and local browser/server access needed elevated execution in
this sandbox. TypeScript remains pinned to the verified 5.9 toolchain; the earlier
--showConfig failure is environment-dependent, not a proven TypeScript 6 defect.

Actual external email delivery, Spotify/YouTube playback permissions, Instagram
embed permissions, native original playback and production Core Web Vitals are
not verified. The browser video test stubs the external iframe document to test
the site's modal/focus behavior; it does not prove playback. Unit delivery tests
mock the adapter to check acknowledgements and failures. No real enquiries sent.

## Outstanding production configuration

- Verified booking destination and a real HTTPS email delivery adapter/token.
- Shared rate limiter for multi-instance hosting, and provider bot controls.
- Verified domain, final privacy wording, confirmed media rights.
- Confirmed release cover/metadata and artist-authored full individual biographies.
- Actual upcoming show and ticket data; no shows are fabricated.
- Rights-cleared original film/captions for native playback, if wanted.

Use npm ci, npm run dev for local review. Build/check instructions are in README.
The owner subsequently authorized publication and deployment through GitHub main.


## Spotify, landing motion and transparent logo update

- Persistent official Spotify Embed API player; Home and Music buttons play in
  the website, with verified Spotify track IDs for the two existing song titles.
- Best-effort autoplay, honest blocked/loading/error states, pause/off controls,
  session sound preference, and automatic pause when opening the film.
- Home title entrance, breathing rings, moving highlight arc, slow photo motion,
  pointer/scroll depth, Pause motion and reduced-motion support.
- Image-editor transparent white PNG replaces the header logo. Original preserved.
- TypeScript, ESLint, 14 unit tests, production build and 20 browser checks passed
  including the final logo/layout adjustment. Browser Spotify tests mock the SDK;
  actual provider playback and universal audible autoplay are not verified.


## Header player and Home ripple revision

Story: arrival → official Spotify SDK → immediate play request → confirmed status
in the transport beside the logo; the same player remains mounted on navigation.

- Removed the floating soundtrack box and visible motion button. The header now
  contains play/pause, confirmed status, and an accessible native-player dropdown.
- Starts with the existing verified Camp Chair URI. No login/token or audio URLs
  are scraped. A play request does not become a playing state until Spotify confirms.
- Allowed Spotify's script CDN in CSP. A CDN-loading browser fixture verifies this
  boundary. This addresses a likely cause of the reported fallback; live SDK
  execution cannot be confirmed because this environment does not allow Spotify
  network access. Native fallback is compact and the failed API mount is hidden.
- Added an initialization watchdog and first-page-interaction retry; kept manual
  pause/off and session preference. Browser/Spotify restrictions still govern
  audible autoplay, full tracks and previews.
- Added a local WebGL water-refraction shader only on Home, using the actual photo.
  Arrival and pointer/touch ripples stop rendering after settling. Pixel ratio and
  resolution are capped; hidden/offscreen pages suspend rendering. Reduced motion,
  shader failure and context loss restore the unchanged accessible photograph.
- Page wipe: 0.9s cover, 0.35s brand hold, 1.1s reveal. The veil is managed separately
  from page-reveal cleanup, preventing an abrupt reset on route changes.
- Browser integration tests use a simulated Spotify CDN and controller. They verify
  startup requests and UI behavior, not actual third-party audio playback.

Final verification: TypeScript, ESLint, 14 unit tests, production build and all
22 Chromium browser checks passed. Inspected desktop/mobile header screenshots
and the actual water-refraction output. No live Spotify playback claim is made.


## Full-logo Home revision

The owner requested replacing the Home photograph with the full official mark.
Reused the image-editor transparent PNG already made from the same supplied logo;
no new logo was generated and the original JPEG remains unchanged. Home displays
the complete mark on black, with an accessible heading and contained image sizing.
The soundtrack, navigation, calls to action and slow page wipe remain available.
The Home-only ripple now samples RGBA and composites transparency onto the site
background, preventing transparent pixels from appearing as white artifacts.

Validation: TypeScript, ESLint, production build and nine targeted Chromium checks
passed, including all six pages at six viewport sizes, Home-only ripple and
reduced motion. Desktop/mobile screenshots and live shader output inspected.


## Spotify consistency repair and photographic Home restoration

Restored Home, its photo motion and water shader to the photographic version at
48c6780. The transparent header logo and slow page transition remain.

Confirmed defects in the previous implementation:
- Every Play click before initialization could increment the attempt counter,
  destroying/restarting a loading player.
- A controller could receive Play before its ready event; track selection also
  requested Play immediately after loading a new URI.
- Blocked autoplay and API failure left the useful native controls hidden.
- The previous simulated vendor script never exercised an eval-dependent SDK
  bootstrap under the actual production security policy.

Repaired the lifecycle so loading clicks update playback intent without remounting.
A track change gets a fresh inner controller; only its ready event triggers Play.
Stale callbacks from prior selections are ignored. Navigation preserves the outer
frame, the SDK loader and playback. Explicit Off unloads all nested playback.

Moved vendor script loading into a dedicated same-origin frame with a scoped
compatibility policy (including eval). The main application retains its stricter
production policy. Messages require both exact origin and the expected window,
with validated Spotify artist/track URIs. The frame has no application payloads
or credentials passed to it. This addresses a possible production CSP incompatibility;
actual live SDK execution is not established by the simulated regression test.

Blocked playback opens the native controls after five seconds. Manual music
actions open them immediately. SDK failure produces one native fallback in the
same frame, with explicit reconnect. Late SDK readiness cannot replace a native
player that may already be in use. Confirmed playing state still comes only from
Spotify events; native fallback reports that native controls are needed.

Verification uses a CDN fixture that actually executes an eval-dependent script
in the player frame, plus delayed readiness, rapid repeated Play, rapid track
selection, blocked autoplay, native fallback, Off/On, native resume and forged
message checks. These are integration tests, not proof of audible Spotify playback.
This environment's network policy excludes Spotify, so real account/territory/EME
playback must still be checked in an ordinary browser.

The pause/session regression was also corrected: persisting the session's Off
preference no longer unloads the controlled player on Pause. Native Resume remains
available; only explicit Off (or an uncontrollable native fallback being stopped)
unloads playback.

Final verification: production build, TypeScript, ESLint, 14 unit tests and all
29 browser checks passed. Inspected the restored photographic Home screenshot.
Real Spotify audio remains unverified due to the environment network restriction.


## Targeted catalogue and Home refinements

- Removed `water-ripple.tsx`, its canvas, shaders, listeners and active CSS. No
  ripple dependency was installed, so no unrelated packages were removed. Kept
  twelve rings, image depth, typography, navigation and slow page transitions.
- Added the exact original JPEG from HomePage.zip as homepage-cover.jpg. It is
  3072×4096; contained rendering preserves all four people on desktop and phone.
- Added catalogue.ts (11 album tracks in official order, full credits/durations,
  official cover, plus tatana, mathata. and the Fetlhela collaboration). Existing
  album/single versions of the same songs are not duplicated. Reviewed official
  artist top tracks, the album embed, earlier single pages and the distributor's
  Ground 2 Glory link. No exhaustive discography claim is made.
- Five static direct track IDs were independently verified: momma , phone,
  peaky , blinder, camp , chair, maatla , thata and tatana, mathata. Eight entries
  have explicit supported Spotify album/release fallback actions when their
  direct IDs cannot be validated.
- Added a bounded public metadata reader for two fixed album URLs. It accepts
  track IDs only on matching names and THE NORTHMOB credits, never returns audio
  or tokens, preserves known IDs, caches results and tolerates network/format
  failures. Runtime enrichment may enable the remaining direct actions; this is
  not claimed as live verified in the restricted execution environment.
- One persistent queue adds monochrome previous/next controls, track/artist labels,
  actual-end advancement and session track/position restoration. The native album
  player handles album ordering when direct IDs are unavailable. Outbound Music
  listening links pause site audio. Removed the dropdown arrow and panel chrome.
- Autoplay requests remain best-effort. Unconfirmed playback displays Enable Sound;
  native controls appear only after manual activation, not as an unsolicited popup.
  Native fallback does not claim audible playback. Full tracks, login, encrypted
  media and territorial availability remain subject to Spotify/browser policy.
- Music uses the official Spotify cover; network failure shows an honest release
  link instead of wrong artwork or a broken-image state.

Verified source references:
https://open.spotify.com/embed/album/3f1HZdfe4bPLqQOu5sfmvO
https://open.spotify.com/embed/artist/0iZ4kkTa0bDsMz9Qgrr0zx
https://open.spotify.com/embed/track/0uOQ2hUkWqG7Mk38yQpYt9
https://open.spotify.com/embed/track/6DiWTgc5snndkCPs2ohJwN
https://open.spotify.com/embed/track/6VwibeE8WERPrdtq9zPF75
https://open.spotify.com/embed/album/10upZ9wALA9z8ByE3nZTHk
https://africori.to/ground2glory

Browser tests use a deliberately labelled artwork fixture and simulated SDK;
inspected hero screenshots use the actual supplied photograph. The official cover
URL is verified against Spotify metadata, not by a live browser image download
in this environment. No new tracks or artwork were fabricated.

Final checks: TypeScript, ESLint, production build and 17 unit tests passed. The
32-case browser suite passed, followed by 14 targeted checks (including two new
metadata/artwork cases), and eight responsive/image checks after the final mobile
framing adjustment. Inspected actual photo screenshots at desktop and 375×812.
Previous/next icons are monochrome SVGs. No water component, shader or canvas
remains in the application source.

Coverage: 13 verified track entries across one complete 11-track album, one single
and one collaboration from another album; five statically verified direct track
IDs. Remaining entries use supported Spotify album/release listening unless the
public metadata enrichment validates their direct IDs. No exhaustive catalogue,
real audible Spotify playback, actual Safari/iOS playback or full-song access
claim is made. No standalone licensed audio files were supplied.
