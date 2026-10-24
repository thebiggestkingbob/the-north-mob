# Master brief completion register

Updated 23 October 2026. The approved cinematic design is locked by DESIGN-LOCK.md. This register describes actual implementation, not a claim that the platform is complete.

| Requirement | Actual state | Remaining acceptance work |
| --- | --- | --- |
| Cinematic public chapters | Home, Music, The Mob, Visualz, Live, Business and Shop routes implemented; approved film hero and chapter navigation | Real-device Safari/Android performance and accessibility review |
| Persistent music | Root Spotify engine, compact controls, queue recovery and provider status implemented | Actual Spotify/device testing; unrestricted playback is not supported by the chosen provider |
| Studio owner access | Server authentication, owner membership checks, protected routes and no public signup implemented | Hosted project connected and schema installed; owner account, MFA/recovery and hosted-session tests still pending |
| Events | Draft/edit/publish/archive, revision conflicts, append-only audit; published records feed Live | Hosted owner-to-public end-to-end verification, verified flyers/archived media, city filters and opt-in event alerts |
| Artists | Draft/edit/publish/archive, version conflicts, atomic audit; published profiles feed The Mob | Hosted verification; approved additional biographies/links when supplied |
| Media Library | Owner upload/edit UI, signature and size checks, image decoding/re-encoding, private originals, optimized derivatives, rights/alt text, draft/publish/archive and audit implemented; hosted buckets/policies installed | Hosted owner upload/download test, recovery after network/storage failures and operational cleanup; no owner exists yet |
| Music publishing | Studio release/track editor, revisions/history, publication controls; public H4B and persistent queue consume published data; 11 H4B + 2 supplementary tracks preserved | Hosted owner-to-public test, real Spotify/device verification; supplementary metadata remains explicitly incomplete |
| Visualz management | Studio video/photo editing, album labels, category, featured ordering and draft/publish/archive with history; public layout uses published records; six videos/nine photos preserved | Hosted owner end-to-end test; richer album/tag/artist/event relationships and discovery remain |
| Enquiries | Validated adaptive public form and Brevo/adapter delivery or explicit mail-app fallback | Durable submission store, owner statuses/notes/assignment, delivery outbox and retries |
| Fans | Explicit signup consent and existing Brevo subscription adapter | Durable consent history, suppression/preferences, fan directory/export/correction/deletion and retention |
| Campaigns | Not implemented | Drafts/templates/preview, approved test/send, scheduling, unsubscribe, delivery history and idempotency |
| Custom commerce | Shop-only Polaroid prototype: 13 visually audited products/20 images, recommended prices, local cart/wishlist/demo stock and simulated checkout; no real payment or order | Studio products/orders, durable commerce inventory, confirmed sizes/fulfilment/policies and operational tests remain. Live payment integration is explicitly excluded for now |
| Cross-content discovery | Per-library Visualz search and artist deep links implemented | Unified search across music, artists, videos, photos, events and products |
| Settings / Analytics | Not implemented as Studio modules | Editable safe settings, privacy-conscious real metrics; never fabricate counts |
| Operations | Local build, unit/browser and PostgreSQL policy checks | Shared rate limiting, production monitoring, backups/restore rehearsal, hosted provider/sandbox purchase tests and launch review |

## Release conditions

No production launch or promotion is authorized by this register. Use protected feature previews while completing the platform. Passing fixture/local tests does not establish hosted Auth, email delivery, Spotify playback, payments or backup restoration.

Database: user connected **NORTH MOB Website**, project `cbybcyeltayiuazbhskm`, through the **THE BIGGEST HQ** account. Existing schema, approved seeds and policies are installed. No new billable project was created. Payment integration remains explicitly excluded by the owner. Branch-scoped preview uses only URL and publishable key. Owner email supplied: thebiggest.kingbob@gmail.com; no Auth user or membership has been created.

Apply all migrations and the idempotent seed before setting the Supabase URL/publishable-key environment variables. Configured public content readers fail closed on database errors; they do not resurrect archived bundled content. The seed preserves owner changes on conflicts.

## Artist-module verification

TypeScript, ESLint and production build passed. 75 unit tests and 55 Chromium browser tests passed. The network-isolated PostgreSQL checks verified owner/non-owner access, private drafts, publication, archive, stale revisions and append-only history. Hosted authentication, database integration and real-device checks remain outstanding. No production changes or messages were sent.

## Content-module checkpoint — 23 October 2026

TypeScript, ESLint, production build, 92 unit tests, the disposable PostgreSQL policy/history suite, and all 80 browser regressions passed; eight affected browser checks passed again after the final player/API changes. Hosted anonymous queries confirm 13 tracks (11 H4B), six videos and nine photographs, with no anonymous writes or access to media rights/original paths. Hosted security advisor returned no findings. These are not a claim of hosted login or owner upload acceptance: the database still has zero Auth users and zero owners. Fixture playback tests do not establish real Spotify availability.

Migrations were applied through the connected Supabase migration API. Local migration filenames are aligned to the observed remote ledger; do not reapply the earlier original filenames. `visualz-seed.sql` and `music-seed.sql` are idempotent and preserve owner edits. Media originals are private; only published, processed derivatives are anonymously readable. Published imagery is inherently public; archiving blocks subsequent origin requests but cannot retract a downloaded copy.

Studio development remains incomplete: enquiries inbox/storage/workflow, fan directory/consent lifecycle, campaigns, products/inventory/orders (without live payments), settings, analytics, shared limiting, MFA/recovery and operational backup/restore remain future work. No mock completion screens were added for these modules. This checkpoint does not authorize production promotion.

The performance advisor identified duplicate permissive read policies and two missing audit foreign-key indexes. The sixth migration consolidates public/owner read predicates without changing visibility, adds the indexes and preserves all passing role tests. Fresh indexes may be reported as unused until real traffic; they are retained for history/foreign-key access.

## Shop prototype — 24 October 2026

The separate Shop brief authorizes prototype prices and stock recommendations, simulated availability and browser-only checkout. This permission does not authorize real sales or imply that Studio commerce administration is complete. See SHOP-PROTOTYPE.md and MERCH-ASSET-AUDIT.csv for all thirteen products, twenty image mappings, prices, statuses and limitations. Product sizes, manufacturing claims, release dates, actual fulfilment and actual payment were not invented. No database migrations, provider charges, notifications or production promotions are part of this work.
