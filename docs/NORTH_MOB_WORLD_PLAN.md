# THE NORTH MOB WORLD — Integration Plan

Status: planning scaffold on feature/north-mob-world. Production website remains unchanged.

## Existing stack verified
- Next.js 16 App Router, React 19, TypeScript
- Supabase packages already present
- Existing routes: /shop, /the-mob, /music, /visuals, /live
- Existing domain and Vercel deployment should remain untouched until preview review

## Architecture
- Add /world as a separate, lazy-loaded client-side 3D experience.
- Keep standard website navigation and shopping paths functional and accessible.
- Reuse canonical content modules / existing APIs; do not duplicate inventory, pricing or event information.
- Store optimized GLB assets and textures in versioned asset paths or dedicated CDN.
- Introduce React Three Fiber, Drei and Rapier only after dependency and build compatibility checks.
- Avoid introducing secrets into client bundles.

## Milestones
1. Content audit: inspect shop product data, image paths, member profiles, YouTube IDs, music embeds, events and any checkout handling.
2. Route scaffold: create /world with accessible entry screen and fallback to standard site; dynamic import of 3D canvas.
3. World shell: character selection, street, labelled buildings, accessible interiors and reliable movement/collision.
4. Media: video playback inside cinema (embedding permissions apply); photos as gallery textures; music via approved streaming embeds.
5. Commerce: reuse canonical cart and checkout, do not simulate payment in production.
6. Performance and quality: desktop/mobile input, reduced motion, progressive loading, browser testing, Vercel preview.
7. Release gate: review preview and merge only after explicit approval.

## Safety rules
- No changes to existing live routes during initial implementation.
- No main branch writes or production deployment.
- Do not invent likenesses, product prices, event details, or usage rights.
- Preserve a 2D navigation fallback.

## Implemented on development branch
- /world embeds an isolated 3D street prototype with member selection and five destination triggers.
- /world/catalog reads the canonical merchandise config; product links lead to the official shop.
- /world/visualz uses publishedVisualz() for videos and photo archives.
- /world/studio uses publishedMusic() and official Spotify embeds.
- /world/live uses publishedEvents() and published ticket URLs.
- tests/e2e/world.spec.ts contains route/content smoke tests.

## Verification commands
Run on a checked-out feature branch with Node 22 and dependencies installed:
```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm run test:e2e -- tests/e2e/world.spec.ts
```
The tests have been committed but not executed in this session. A browser/network environment is needed to verify the Three.js CDN module import and real 3D controls. Vercel deployment listing returned 403, so preview status remains unverified.

## Known gaps
- 3D canvas currently uses a CDN-hosted Three.js module and simple primitive geometry; production bundling, asset loading, accessibility and error handling require more work.
- World interiors currently open embedded published-content views, not spatial 3D rooms.
- Current character meshes are placeholders; no member likeness has been approved or imported.
- Commerce uses official shop navigation, not an in-world cart.
- Existing root SiteShell is inherited by world subroutes; review its layout and focus behavior on mobile.
- Validate video/photo embeds and any third-party playback restrictions in browser.
