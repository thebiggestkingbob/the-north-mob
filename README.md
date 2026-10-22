# THE NORTH MOB

Cinematic six-page Next.js website based on the owner-supplied six-panel reference.
The supplied official logo, original photographs and four named WebP portraits are
used directly. No stock or generated artist imagery is used. Production is hosted at
https://the-north-mob.vercel.app through the GitHub main branch integration.
The transparent header logo was made with the image editor from the supplied logo;
the original JPEG remains unchanged.

## Local development

Use Node.js 24 (`nvm use`) and npm:

```sh
npm ci
npm run dev
```

The app runs at http://localhost:3000. To check and serve a production build:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

For browser tests, install Playwright Chromium (`npx playwright install chromium`)
or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing Chromium executable, then
run `npm run test:e2e`. The browser suite starts the production server and therefore
requires a completed build. Screenshots go to ignored `work/screenshots/`.
In this managed environment, build subprocesses, network access and localhost
binding may require the execution tool's elevated permissions.

## Pages and content

- Home `/`: supplied HomePage.jpg hero with all four subjects contained, oversized title,
  twelve SVG rings and pointer/scroll depth. No video or water effect.
- Music `/music`: HERE 4 BUSINESS composition, the verified 11-track HERE 4 BUSINESS album and two additional verified tracks and a
  persistent in-page Spotify player and catalogue controls.
- The Mob `/the-mob`: four supplied portraits; keyboard accessible, animated
  profiles with query-string deep links and browser back/forward support.
- Visuals `/visuals`: poster-first in-page official YouTube film, three official
  Instagram reel links and a photograph strip. Closing removes playback. Native
  video replaces the iframe when an authorized original URL is configured.
- Live `/live`: photographic heading and an honest no-announced-dates state.
- Business `/business`: validated enquiry UI with server endpoint and an explicitly
  unconfigured state until delivery credentials exist.

Edit `src/config/content.ts` for artist taglines, links, songs and confirmed shows.
Portrait-to-name mapping follows the owner-uploaded filenames; mockup faces were
not used to infer identities. Song titles and collective biography come from the
supplied Spotify evidence. The group photograph on Music is not claimed to be
verified release artwork. No mockup tracklist, durations, release year, listener
counts, fictional events or guessed contact address are published.

GSAP/ScrollTrigger and `useGSAP` are registered in `src/lib/animation.ts`. Shared
navigation uses a transition veil and entrance reveals; overlays and Home add
contextual motion. The page wipe covers in 0.9 seconds, holds the brand for
0.35 seconds, then reveals over 1.1 seconds. Animations are scoped and cleaned up. Reduced-motion users
receive the full experience without movement. Typography is served locally.

Original brand photographs are in `public/assets/`; named artist WebPs are in
`public/assets/artists/`. Original ZIP prompts, Spotify evidence and earlier mockup
candidates remain in `references/`, outside the public directory. The owner's
subsequently attached six-panel image authorizes the layout reference; its sample
content is not treated as verified release/event metadata. Keep source assets
intact and supply newly approved media deliberately, without secret credentials.

## Configuration and delivery

Copy `.env.example` to `.env.local`. Leave unknown values blank. Never commit
credentials or prefix private credentials with `NEXT_PUBLIC_`.

- `SITE_URL`: verified canonical HTTPS origin. Without it, indexing is disabled,
  the sitemap is empty, and social metadata uses localhost for local review.
- `CONTACT_DELIVERY_URL`: owner-controlled HTTPS delivery adapter endpoint.
- `CONTACT_DELIVERY_TOKEN`: server-only bearer token for that adapter.
- `NATIVE_VIDEO_URL`: optional rights-cleared original on an HTTPS media CDN.
- `NATIVE_VIDEO_CAPTIONS_URL`: optional WebVTT captions for the native player.

Without the delivery variables, the form validates an enquiry and prepares a
mailto draft to the owner-confirmed booking address in `src/config/content.ts`.
Visitors must send it from their email app; the website does not claim delivery.
With both delivery variables configured, server delivery is used instead. The endpoint validates
JSON with Zod, limits request size, rejects a populated honeypot, checks origin,
and throttles submissions. It sends `{name,email,type,message,consent}` as JSON
with the bearer token. The delivery adapter must send to a verified booking
address and return HTTP 2xx with `{"delivered":true}` only after actual delivery.
An HTTP success without that acknowledgement produces an error in the UI. No
provider integration or real email delivery is claimed as verified.

Throttling currently uses a global bucket of 10 requests/minute per Node process;
it does not trust spoofable client IP headers. Before a multi-instance deployment,
replace it with a shared durable limiter and configure provider-level bot controls.
The app does not retain enquiry payloads. Confirm the delivery provider's data
handling, booking destination and final POPIA privacy wording before opening the
form publicly. Current privacy copy describes only the intended enquiry flow.

YouTube loads after interaction. Spotify attempts playback on arrival, remembers
sound-off for the session, and provides compact play/pause controls next to the logo, with native
Spotify controls shown only when needed after activation. There is no dropdown
arrow. The initial selection is camp , chair.
The SDK requests play as soon as the embed is ready. Blocked autoplay displays
Enable Sound; manual activation opens the native controls when needed. Repeated startup clicks do not
restart initialization. Track changes wait for a fresh controller to be ready. Audible
autoplay may be blocked by browsers; users can enter with sound with a tap.
Spotify account, territory and licensing rules can limit playback to previews. Instagram reels use official
outbound fallback links. Provider playback/embedding can be restricted; external
platform permissions are not guaranteed. Do not download social videos. Native
video uses standard accessible browser controls, poster support and optional
captions; it is not a separate custom controls implementation.

## Before deployment

Confirm photographic/video rights, portrait mapping, verified release artwork and
metadata, real show/ticket data, domain, privacy wording, delivery credentials,
shared rate limiting and actual delivery with test credentials. Verify third-party
playback in a normal browser. Rebuild after configuring values consumed by static
pages, then repeat checks. Obtain explicit owner authorization before deploying.
The owner authorized publication and deployment; pushing main triggers Vercel.

See `IMPLEMENTATION_REPORT.md` for the actual verification results and limits.


The water shader/component and its listeners were removed. Other GSAP motion
and page transitions remain. `public/assets/homepage-cover.jpg` is the unchanged
3072×4096 image from the owner's HomePage.zip; responsive containment keeps all
four subjects visible. Next.js serves optimized versions at approved quality 90.

Spotify runs in `/spotify-player`, a dedicated same-origin HTML frame with its own
vendor script policy. The main application does not allow production unsafe-eval.
Messages are checked against both the frame window and exact origin. Native
fallback stays inside that single frame and does not claim confirmed playback.
Only explicit reconnect/off actions remount the outer frame. Automated tests
simulate SDK delays, CDN loading, autoplay refusal, native fallback and recovery;
actual Spotify audio remains a separate browser/provider check.


Catalogue data is in `src/config/catalogue.ts`: 11 verified album entries plus
`tatana, mathata.` and the credited `Fetlhela` collaboration. The five statically
verified track IDs remain usable if metadata enrichment fails. `/api/catalogue`
reads only public embed metadata for two fixed release URLs, accepts IDs only
when names and North Mob credits match, and returns no audio, preview URLs or
tokens. Unknown IDs are never guessed: those rows explicitly offer Spotify album
selection or the verified external release. This is the verified catalogue found
for this update, not a claim of an exhaustive discography.

The header has previous/play-pause/next and Off controls, plus the current title
and artist. The dropdown arrow was removed. Navigation preserves one player.
Known tracks and playback position are saved for the session; reload seeks when
the controller is ready. Track-end events advance the addressable queue once;
Spotify manages its own native album queue. Audible autoplay is attempted but
never assumed. A blocked request shows Enable Sound; only manual activation
reveals necessary native controls. Native controls stay visible for album listening.

The album cover uses its official Spotify CDN URL; a failed request shows an
explicit release link, without substituting artwork. Tests simulate external
metadata, artwork and Spotify playback; they do not establish provider audio
access, Safari/iOS playback or unrestricted full-length streaming.
