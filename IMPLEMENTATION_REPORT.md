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

## Homepage hero restoration and supplied H4B artwork correction

This correction supersedes the previous contained/stacked hero and remote-artwork implementation.

- The approved `homepage-cover.jpg` now fills the entire hero behind the existing title, with `object-fit: cover`, responsive focal positioning and overscan to prevent gaps during parallax. Existing title typography, placement, navigation and player are retained.
- Recovered the original GSAP ScrollTrigger technique from commit `617faec`: scrubbed ring translation (55px) and rotation (8 degrees), plus pointer depth. Applied the same scrub technique to the photographic layer (−24px to +24px); retained the approved ambient motion and reduced-motion/hidden-tab handling. The original initial implementation animated the rings rather than the photograph; this extends its technique to the requested background layer.
- Extracted the exact supplied 2048×2560 JPG to `public/assets/h4b-album-cover.jpg`. Next Image supplies responsive optimized images at quality 90. The complete portrait artwork fits within the existing featured-cover region, preserving its text and layout.
- Featured artwork has no anchor, click handler, redirect or Spotify-linked error fallback. Catalogue links, album selection and global player are preserved.
- No water, ripple, shader or canvas effects are restored.
- Screenshots: `work/screenshots/1440-home.png` and `work/screenshots/375-home.png`; Music previews are alongside them. Screenshots use reduced motion and a mocked Spotify provider, not live audio.

Modified files: `src/app/globals.css`, `src/components/home-parallax.tsx`, `src/components/spotify-player.tsx`, `src/config/catalogue.ts`, `public/assets/h4b-album-cover.jpg`, `tests/e2e/soundtrack.spec.ts`, and this report.

Validation: TypeScript, ESLint, 17 unit tests and production build pass. Browser verification covers six routes at 320/375/768/1024/1440/1920px, artwork loading/non-navigation, catalogue/player lifecycle, navigation, accessibility and screenshots. Live Spotify audio is not verified by the mocked provider checks; existing browser/account restrictions still apply.

Final browser results: all 34 tests passed (1.5 minutes), followed by a passing targeted check that scrolling changes the background transform while the full-width layer and absence of water effects remain verified. No browser page errors were observed in the responsive route tests.

## October 2026 Live content and Business form refinement

- Recorded all seven announced gigs with their exact event names and locations, retaining all three 3 October performances and both 31 October performances in chronological order. No times, ticket prices, links or venue details were added.
- The existing Live page had no separate past-events presentation. Reused its single event-list layout and existing fourth column for explicit `Past event` / `Upcoming gig` text. On 22 October 2026 this shows five past events and two upcoming gigs. The section heading is `October 2026 gigs` so it does not mislabel the whole list as upcoming. Retained `More dates to be added.` in the existing section-label text area.
- Status uses the Johannesburg calendar date, with hourly page revalidation so dates are not frozen to the deployment day. Hero imagery, spacing, row styles, animations and responsive CSS are unchanged.
- Removed the Business form container border and the delivery notice's decorative divider. Container background is transparent; layout, field styling, accessible focus indicators, validation and submission code are unchanged.
- The delivery service remains unconfigured: the existing truthful notice and disabled submit button are preserved. Actual enquiry delivery requires the previously documented delivery-service connection; this styling task does not enable it. Unit tests cover successful acknowledged adapter delivery as well as validation/failure paths.

Modified files: `src/config/content.ts`, `src/app/live/page.tsx`, `src/app/globals.css`, `tests/e2e/site.spec.ts`, and this report.

Validation passed: TypeScript, ESLint, all 17 unit tests, production build, and all 16 site browser tests. Browser checks include all six pages at six widths, exact gig names/dates/venues/statuses, absence of invented ticket links, form keyboard focus/native validation, the unconfigured delivery boundary, navigation, and refreshed desktop/mobile screenshots. Visual review confirmed the existing Live layout and border-free form container.

## Listening, mobile controls, gigs and enquiry usability

- Playback resumes from its stored position after Off/On in the same visit. Stalled buffering now reaches an honest manual recovery state after eight seconds instead of leaving the transport indefinitely starting. Reconnect is available for blocked-start as well as native fallback states. Confirmed Spotify events remain the only source of playing status; browser/account autoplay restrictions are not bypassed.
- Mobile player transport now has four 44×44px touch targets with readable track/status text on a dedicated header row beneath the logo. Header and Home title/location spacing are adjusted to avoid overlap. Other pages retain their layouts.
- Live lists Upcoming gigs before Past shows, reusing the existing section-label and event-list styles. All seven exact events remain; dates are chronological within each group. Mobile rows show date/status, event name, and venue on separate clear lines. Current Johannesburg date drives grouping with hourly revalidation.
- Hero ambient animation pauses while offscreen as well as in hidden tabs. Reduced-motion behavior remains intact; no water effects were added.
- User confirmed the Brevo account email should receive enquiries. Read-only account lookup verified `thebiggest.kingbob@gmail.com`. Business now offers a validated, encoded email draft to that address when the delivery adapter is unavailable, plus an explicit fallback link and visible address. No message is sent automatically, entered text remains, and the form tells visitors they must send from their email app. Server delivery remains available when configured.
- Brevo plugin is connected but exposes no signup-form creation or contact-write tools. The only visible list is “Your first list” (ID 2); its use for North Mob subscribers has not yet been confirmed. Signup is pending a public Brevo form URL or server-only API key plus destination-list confirmation. No nonfunctional signup widget or fake subscription confirmation was published.
- Vercel CLI email-integration discovery could not proceed without authentication; existing connector inspection permissions remain restricted. Deployment continues through the authorized GitHub integration.

Checks: production build, TypeScript, ESLint and 17 unit tests pass. All 39 browser tests passed for playback, mobile controls, gig grouping and other routes before the final booking-email refinement. Final contact-flow/site checks are recorded below. Real Spotify account/audio and physical-device performance have not been verified; Chromium responsive checks are not physical-phone tests.

Final contact checks: 16 site checks passed before the draft-navigation adjustment; the draft test revealed that this managed browser blocks external email navigation. The form now prepares the draft and exposes an explicit `Open enquiry in your email app` link, retaining all entered data rather than navigating automatically. Three final targeted checks for the email fallback, accessible form and responsive screenshots passed. The encoded recipient/body draft test was also rerun separately. No email delivery is claimed or attempted by these tests.

## Brevo signup and enquiry integration

The owner supplied a screenshot confirming `BREVO_API_KEY` is saved for Production. Its value was never requested, read, committed or printed.

- Added server-side calls to Brevo's official `/v3/contacts`, `/v3/contacts/lists`, `/v3/smtp/email` and read-only `/v3/account` APIs. Requests use the private `api-key` header, bounded timeouts, no redirects and no caching. API references: https://developers.brevo.com/reference/create-contact , https://developers.brevo.com/reference/create-list , https://developers.brevo.com/reference/send-transac-email .
- Inner-page footers now have a minimal email signup and explicit unchecked consent. The endpoint validates email, consent, origin, honeypot and bounded request size. It uses a dedicated `THE NORTH MOB — Website` list, created lazily in the account's previously verified folder 1 on the first signup, or an optional `BREVO_LIST_ID` override. It does not use the generic unrelated list. Suppressed contacts are not changed or re-enabled. No campaigns or automatic marketing emails are sent by signup.
- Signup reports receipt only after the provider operation succeeds, with neutral acknowledgement for already suppressed addresses. Failed submissions retain entered details. Per-process throttling is included; shared/provider-level limits are still required at larger scale.
- Business uses Brevo when the key is present and no explicit legacy adapter is configured. Enquiries go to the owner-confirmed `thebiggest.kingbob@gmail.com`, using that account's active sender email and the visitor as Reply-To. Plain-text content prevents submitted markup from rendering. A Brevo message ID produces `accepted:true` and a submission acknowledgement, never a claim of inbox delivery. Existing adapter delivery acknowledgement and email-draft fallback are preserved.
- `/api/health/brevo` returns only `{configured,connected}` after a read-only account request. It cannot reveal account details or the key, and sends no email or contact mutations. This check verifies credentials only, not inbox delivery or all write permissions.
- Production rebuild consumes the saved Vercel secret; local builds without it keep the enquiry email-draft fallback. No real key is needed for local tests and no key reference or Brevo API hostname is present in the browser bundle.

Validation: TypeScript, ESLint, production build and all 32 unit tests pass. The browser suite passed 40 checks; two enquiry-field checks needed scoping after the second email field was added, and both passed on targeted rerun. Coverage includes consent, provider success/failure, preserved form values, booking fallback, all six routes across six widths, keyboard focus, navigation and existing soundtrack behavior. Tests use fixture-only provider responses; they send no actual email or signup data to Brevo. Live Production credential verification is recorded after deployment separately.
