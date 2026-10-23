# Master brief completion register

Updated 23 October 2026. The approved cinematic design is locked by DESIGN-LOCK.md. This register describes actual implementation, not a claim that the platform is complete.

| Requirement | Actual state | Remaining acceptance work |
| --- | --- | --- |
| Cinematic public chapters | Home, Music, The Mob, Visualz, Live, Business and Shop routes implemented; approved film hero and chapter navigation | Real-device Safari/Android performance and accessibility review |
| Persistent music | Root Spotify engine, compact controls, queue recovery and provider status implemented | Actual Spotify/device testing; unrestricted playback is not supported by the chosen provider |
| Studio owner access | Server authentication, owner membership checks, protected routes and no public signup implemented | Dedicated hosted project, confirmed owner provisioning, MFA/recovery and hosted-session tests |
| Events | Draft/edit/publish/archive, revision conflicts, append-only audit; published records feed Live | Hosted owner-to-public end-to-end verification, verified flyers/archived media, city filters and opt-in event alerts |
| Artists | Draft/edit/publish/archive, version conflicts, atomic audit; published profiles feed The Mob | Hosted verification; approved additional biographies/links when supplied |
| Media Library | Approved assets are bundled and documented | Private originals, safe uploads/processing, rights records, controlled derivatives and owner UI |
| Music publishing | Verified bundled catalogue and artwork | Studio release/track management and published catalogue integration |
| Visualz management | Working public video/photo browsing, filters and lightbox | Studio albums, tags, featured selection and publishing |
| Enquiries | Validated adaptive public form and Brevo/adapter delivery or explicit mail-app fallback | Durable submission store, owner statuses/notes/assignment, delivery outbox and retries |
| Fans | Explicit signup consent and existing Brevo subscription adapter | Durable consent history, suppression/preferences, fan directory/export/correction/deletion and retention |
| Campaigns | Not implemented | Drafts/templates/preview, approved test/send, scheduling, unsubscribe, delivery history and idempotency |
| Custom commerce | Branded Shop empty state; custom-store decision retained | Products/variants/inventory/cart/orders plus approved pricing/photos/policies. Gateway connection deferred by owner; no functional checkout claimed |
| Cross-content discovery | Per-library Visualz search and artist deep links implemented | Unified search across music, artists, videos, photos, events and products |
| Settings / Analytics | Not implemented as Studio modules | Editable safe settings, privacy-conscious real metrics; never fabricate counts |
| Operations | Local build, unit/browser and PostgreSQL policy checks | Shared rate limiting, production monitoring, backups/restore rehearsal, hosted provider/sandbox purchase tests and launch review |

## Release conditions

No production launch or promotion is authorized by this register. Use protected feature previews while completing the platform. Passing fixture/local tests does not establish hosted Auth, email delivery, Spotify playback, payments or backup restoration.

Database provisioning: owner selected `kingbob-3860’s projects`; quoted project price is $0/month and cost acknowledgement is pending. Payment provider connection is intentionally deferred by the owner.

Apply all migrations and the idempotent seed before setting the Supabase URL/publishable-key environment variables. Configured public content readers fail closed on database errors; they do not resurrect archived bundled content. The seed preserves owner changes on conflicts.

## Artist-module verification

TypeScript, ESLint and production build passed. 75 unit tests and 55 Chromium browser tests passed. The network-isolated PostgreSQL checks verified owner/non-owner access, private drafts, publication, archive, stale revisions and append-only history. Hosted authentication, database integration and real-device checks remain outstanding. No production changes or messages were sent.
