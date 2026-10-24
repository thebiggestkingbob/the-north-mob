# Shop gallery and simulated commerce — 24 October 2026

This is a browser-only merchandise prototype within the existing approved website. No payment gateway, checkout server, database migration, email sender or live order endpoint was introduced. Production promotion requires separate approval.

## Asset audit

Both supplied archives downloaded successfully: `0.zip` contains eleven originals and `8.1.zip` contains nine. All twenty PNGs are distinct by SHA-256. Source dimensions range from 1024×1536 to 1672×941. All are RGB, and the existing photographic backgrounds and original artwork are retained. Originals occupy 49,703,934 bytes and remain unchanged under `/workspace/work/merch-originals/`, alongside the uploaded source archives. They are not published as site assets. Twenty WebP derivatives occupy 4,252,012 bytes; conversion uses quality 88 with no cropping, regeneration, aspect-ratio alteration or colour replacement. Next/Image supplies responsive web sizes.

The full per-image dimension, size, source filename, product-group and integrity inventory is [MERCH-ASSET-AUDIT.csv](./MERCH-ASSET-AUDIT.csv). Every original maps exactly once to a product. Filenames are numeric groups rather than category names. Categories were identified from the actual photographs. Decimal filename suffixes describe views or variants; they are not additional products.

## Catalogue

All prices, statuses and quantities below are editable **prototype recommendations**, not verified retail availability, production margins or stock. Nine products are demo-available, two are sold out and two are coming soon. Prices in the typed catalogue use integer cents.

| ID | Name / category | Supplied images | Recommended ZAR | Demo status / stock | Supported variants |
|---|---|---|---:|---|---|
| h4b-print | H4B Photo Print / Print | 0.png | R199 | Coming soon / 0 | None |
| lineup-tee | Lineup Tee / T-shirt | 1.1.png, 1.2.png | R299 | Available / 12 | Front/back views, not variants |
| portrait-tank | Portrait Tank / Sleeveless top | 2.png | R249 | Sold out / 0 | None |
| h4b-features-tee | H4B Features Tee / T-shirt | 3.png | R349 | Available / 10 | None |
| mob-hoodie | Mob Hoodie / Hoodie | 4.1.png, 4.2.png | R599 | Available / 8 | Front/back views, not variants |
| business-long-sleeve | Business Long Sleeve / Long sleeve | 5.1.png, 5.2.png | R399 | Available / 10 | Front/back views, not variants |
| mob-beanie | Mob Beanie / Beanie | 6.png | R199 | Available / 15 | None |
| mob-socks | Mob Socks / Socks | 7.png | R129 | Sold out / 0 | None |
| mob-flag | Mob Flag / Flag | 8.1.png, 8.2.png | R249 | Coming soon / 0 | Light, Black |
| mob-tote | Mob Tote / Tote bag | 9.png | R199 | Available / 15 | None |
| h4b-mug | H4B Mug / Mug | 10.png | R149 each | Available / 12 shared | Black, White; both pictured together |
| h4b-keyring | H4B Keyring / Keyring | 11.1.png, 11.2.png, 11.3.png, 11.4.png | R99 each | Available / 24 shared | Logo (11.2), photograph (11.3), H4B lettering (11.4); 11.1 is the collection view |
| mob-stickers | Mob Sticker Sheet / Stickers | 12.png | R79 | Available / 30 | None |

Descriptions (8–18 words in the gallery) live with these records in `src/config/merch.ts`. Garment sizes, material composition, weights, mug capacity, flag dimensions and manufacturing details are not supplied and are not invented. Clothing detail panels explicitly state that sizing is unconfirmed. The print is pictured in a frame, but frame inclusion and dimensions remain unconfirmed. No release dates or restocking promises are made.

## Experience and implementation

- `/shop` uses a scoped Polaroid exhibition: off-white borders, thick captions, controlled rotation, staggered positions, varied image ratios and dark negative space. Essential information is always visible; hover/focus only adds lift/straightening. Mobile uses a single readable column.
- `ShopGallery`, `ProductDetail` and one native `ShopModal` handle gallery browsing and views. A single dialog prevents nested modal traps. Escape, backdrop/close, focus restoration, scroll restoration and reduced motion are supported. Dialog content never navigates away from the exhibition.
- `ShopCart` provides a slide-out drawer with thumbnails, variant labels, unit/line prices, quantity controls, removal, subtotal, empty state and checkout. Shared stock limits apply across variants. Demo purchases reduce this browser's remaining stock.
- `ShopCheckout` covers cart review, validated customer details, delivery or collection, summary, demo payment and confirmation. Delivery defaults to an editable R79 estimate; collection is a zero-fee demo choice, without an invented location. No courier partnership is implied.
- Demo payment generates `NM-DEMO-XXXXXXXX`, records items/totals/fulfilment locally, clears the purchased cart and displays an explicit simulation confirmation. No card or banking inputs exist. It sends no order email.
- Coming-soon pre-saves are removable browser-local wishlist entries. No email capture or promised notifications are attached.
- `src/lib/shop.ts` validates restored cart identifiers, variants and integer quantities; rejects unavailable products; clamps shared stock; derives prices centrally; and strips unsupported stored properties. Storage is versioned as `northmob:shop-demo:v1` and contains no customer name, email, phone or address. Those checkout fields exist in component memory only and disappear when checkout closes. The latest thirty non-personal demo confirmations are retained; local purchased quantities remain capped by prototype stock. If browser storage is unavailable, the prototype continues in memory with a visible limitation notice.
- The existing root player, navigation, site identity, public APIs and Studio modules are unchanged. No additional dependencies were installed for the shop.

## Limits before real commerce

All stock is local prototype data, without server-side reservation or cross-device guarantees. Browser storage can be cleared or edited and is not an order database. Confirmed sizes, print/frame details, actual stock, production pricing, shipping/collection policies, customer-service/refund terms and merchant integration are required before selling. No production readiness is claimed.

## Verification

See the final implementation report for command and browser results. Tests use sample contact details and mocked Spotify playback; they do not prove real-provider Spotify availability or physical-device performance.

## Product copy

| Product | Short description |
|---|---|
| H4B Photo Print | The collective in monochrome, shown as a statement photograph for your wall. |
| Lineup Tee | Black tee with a discreet chest mark and bold collective names across the back. |
| Portrait Tank | Black sleeveless top pairing the North Mob chest mark with H4B portrait artwork. |
| H4B Features Tee | Light-coloured tee with collective photography and featured-artist cards on the reverse. |
| Mob Hoodie | Black hooded sweatshirt carrying the North Mob mark and H4B group portrait. |
| Business Long Sleeve | White long sleeve with chest branding, sleeve lettering and the collective lineup. |
| Mob Beanie | Black beanie with a folded cuff and a contrasting North Mob logo patch. |
| Mob Socks | White socks with the North Mob logo positioned below the ribbed cuffs. |
| Mob Flag | The North Mob wordmark fills a hanging flag in contrasting black and light colourways. |
| Mob Tote | Black tote with long handles and a large contrasting North Mob mark. |
| H4B Mug | North Mob and Here 4 Business lettering wrap the pictured black and white mugs. |
| H4B Keyring | Choose the North Mob logo, H4B lettering or collective photograph as your keyring design. |
| Mob Sticker Sheet | A monochrome sticker sheet collecting North Mob logos, artist portraits and H4B graphics. |

## Final verification record

- TypeScript, ESLint and production build passed on the final implementation.
- All 98 unit tests passed, including catalogue/image uniqueness, shared variant stock, corrupted/forged storage, validated checkout data, cart arithmetic, order privacy and stable cart line ordering.
- The full 91-test browser suite passed. After the final unit-price wording, stable-line-order and retained ShopMotion changes, all 17 affected Shop/responsive checks passed again.
- Shop acceptance covers all thirteen products, variant imagery, quantities/removal, reload persistence, unavailable-product prevention, removable local pre-saves, delivery and collection simulation, exact totals, order references, cart clearing, absence of customer details in browser storage/network requests, modal focus/scroll restoration, a sticky close control and blocked-storage fallback.
- All requested sizes (1440, 1024, 768, 430, 390) passed image/card containment and non-overlap checks. Existing seven-page regressions also passed at 320, 375, 768, 1024, 1440 and 1920 pixels.
- Desktop and mobile screenshots were visually reviewed. Original artwork remains unchanged; description contrast and variant accessible names were corrected during QA. The existing reduced-motion-aware ShopMotion component now animates the new heading and toolbar, and the root player retains one engine through internal navigation.
- No real payment, order email, newsletter signup, hosted customer record or database write was made by this prototype or its tests. Real Spotify and physical-device behavior remain outside these mocked/local checks; no production Core Web Vitals claim is made.
