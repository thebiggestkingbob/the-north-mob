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
