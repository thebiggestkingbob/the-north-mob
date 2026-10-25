# Visualz photographs, posters and public sharing — 25 October 2026

## Public sharing correction

Sharing previously inherited `location.origin`, including protected immutable/branch previews. Product, poster and order share URLs now use the verified canonical production origin `https://the-north-mob.vercel.app` from `src/config/site.ts`. Poster links include the photo ID and selected paper size. Old messages cannot be rewritten and still contain their original protected preview links.

Vercel project `prj_Q2My60xEaQnGcO5ksZQAfB0t9OjI` in the existing kingbob team was inspected. Its original `ssoProtection.deploymentType` was `all_except_custom_domains`, protecting the vercel.app production URL. It is now `preview`, verified by read-back: production is excluded from Vercel Authentication, previews remain protected. No Studio authentication, Supabase authorization, password protection or IP rules were changed. A fresh unauthenticated HTTP check was blocked by the execution network proxy (CONNECT 403 before reaching Vercel); this is not evidence of a Vercel login redirect.

## Photographs

The three supplied ZIPs contain 25 JPEGs and one MP4. The requested picture update excludes the MP4. All 25 JPEGs are distinct within the upload. Comparing normalized image content against the existing nine archive photos found nine matches (mean pixel differences 0.13–0.36 versus over 47 for other nearest candidates), manually cross-checked in contact sheets. Those nine keep their existing archive entries and URLs. Sixteen new images are added, giving 25 photographs without duplicate entries.

Full uploaded JPEGs (3072×4096 or 4096×4096) remain under `/workspace/work/visualz-20261025` and in the original uploaded ZIPs. `docs/visualz-20261025-audit.json` records original file names, source ZIPs, dimensions, SHA256 hashes and duplicate decisions. New web derivatives preserve the full frame, fit within 1600×2100 and use WebP quality 84. No photographs, identities, locations or dates were invented.

## Poster purchase flow

Suggested prices: A3 / 297×420mm R199; A2 / 420×594mm R299; A1 / 594×841mm R449. Registered photo viewers show native radio buttons, the selected price, quantity, cart/wishlist/share icons and a link into existing Shop checkout. Radio arrow keys change size rather than accidentally moving to the next photograph. Photo arrows, swipe, deep links, Escape, focus and scroll restoration remain functional. Images fit the paper without cropping; margins may remain and A1 may appear softer at close range. Framing, paper finish and fulfilment are explicitly unconfirmed.

Posters are discoverable/purchasable from Visualz, not additional Polaroids in the main 18-product Shop grid. `findMerch` resolves the poster registry for cart, wishlists, gift checkout and receipt/history reconstruction. Size variants retain their own prices and images. There is no invented physical inventory: poster products have zero stock and a separate 10-per-photo cart limit across sizes. Local checkout does not consume a supposed print stock. Checkout is still a local preview with no payments or print-service request. The header Previous Orders icon is removed; history remains accessible inside the cart.

## REQUIRED sequence when the user approves production deployment

1. Deploy the verified feature commit through main and wait for the production build and assets to be READY.
2. Then execute `supabase/visualz-20261025-release.sql` on THE BIGGEST HQ connection `link_6adb77ab3de48191bde96217fe71a73d`, project `cbybcyeltayiuazbhskm`. This idempotently inserts only the 16 approved new published photo records and never overwrites existing Studio edits/drafts/archives. Existing audit triggers record the changes. Do not activate before production has the files, or the old deployment would show broken images.
3. Verify the expected photo rows, published status and public page. There should be 25 approved published photos unless the owner has intentionally changed publication statuses. Verify RLS remains enabled. No schema migration is required.

Until that release, the hosted database remains at its existing nine published images. A protected Vercel preview supplements the published list with the 16 newly approved bundled release images so the user can review the complete collection. Unconfigured local development uses the complete 25-image bundle. Production never supplements Studio publication results, so database outages and archived uploaded assets do not become public fallbacks. Future review previews can show these approved release assets independently of production publication; production follows Studio status.

## Verification

TypeScript, ESLint, 111 unit tests and production build pass. Tests cover size prices, cart limits without fabricated stock, snapshot preservation, canonical public sharing links and the preview/production publication distinction. Browser checks cover poster sizes and native radio keyboard behaviour, 25 unique archive entries, cart/checkout and receipts, poster wishlist return links, photo deep links, navigation and focus restoration, and preservation of the single soundtrack engine. Existing Shop and shared-layout regression results are recorded in the task completion report. No payment, external message, live order or print fulfilment was submitted.
