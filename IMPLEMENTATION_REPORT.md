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
