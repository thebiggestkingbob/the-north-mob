# North Mob Studio — staged backend implementation

This implements owner authentication boundaries, event management and artist publishing, not the entire Studio brief. Work stays on `feature/north-mob-cinematic-platform`; no production migration or launch is authorized by this setup document.

## Implemented

- `/studio/login`: server-side password sign-in for an already-provisioned, email-verified owner. No public registration or staff invitations.
- `/studio`: real event counts when connected; no invented analytics or placeholder records.
- `/studio/artists`: verified profiles, approved local portraits, biography, display order, draft/publish/archive and immutable history. Published records feed The Mob without changing its design.
- `/studio/events`: create/edit events, save drafts, publish and archive, with version-conflict protection and per-event change history.
- Every protected page and write independently calls verified `getUser()` and queries active owner membership. User-editable metadata cannot confer access. Database row policies independently restrict all writes and private reads.
- HTTP-only session cookies, Studio-only refresh proxy, same-origin write checks, bounded request bodies, server validation, private/no-store responses and noindex.
- Live reads published events from the dedicated database when configured. Before activation, the existing seven verified static gigs remain unchanged. An intentionally empty published catalogue stays empty. A connected database outage shows an unavailable state instead of resurfacing archived static gigs.
- Event changes and immutable audit rows commit together. Version checks reject stale saves. One active owner is enforced by a unique database index. Existing logged-in owners lose data permissions when their membership is revoked.
- Studio has no public player or soundtrack playback. Public-page audio remains persistent across public navigation.

## Dedicated staging project required

The connected Supabase account currently exposes only unrelated Tapped In and Cookie projects. They were not inspected or modified. No North Mob hosted resource was created, no hosted SQL was applied, and no owner/password was provisioned.

Use a separate North Mob staging project. Confirm its organization, region and plan with the owner before creating a billable resource. Only that project may receive this schema. Local `supabase/config.toml` does not change hosted Auth settings automatically.

1. Review all SQL files under `supabase/migrations/` and apply them in filename order to the dedicated project through the approved Supabase migration workflow. Apply `supabase/seed.sql` once; it preserves all four approved artists and seven supplied gigs, including same-day performances. Re-running it does not overwrite owner changes.
2. In hosted Auth settings, disable public signups and anonymous sign-ins. Configure approved site/redirect URLs and provider abuse controls. Create the one owner account through the trusted dashboard, set its password securely, and verify its email. Never share a password or key in chat or git.
3. Bootstrap membership through the trusted SQL console using the verified owner UUID, not an email guessed from booking contact details. For example, replace `VERIFIED_OWNER_UUID` below before running:

   ```sql
   insert into public.staff_members (user_id, role, active)
   select id, 'owner', true from auth.users
   where id = 'VERIFIED_OWNER_UUID'::uuid and email_confirmed_at is not null;
   ```

   Confirm exactly one active membership exists. The application has no route for self-promotion or inviting a second owner.
4. Set **Preview-only** server environment variables `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, then rebuild the protected preview. No service-role key is required by this implementation. Do not reuse another website's credentials. Do not set a public/browser secret variable.
5. Run Supabase security/performance advisors against this dedicated project and resolve findings. The local PostgreSQL checks are not a substitute for hosted Supabase advisors or end-to-end Auth/Data API tests.
6. On protected staging, verify password login/logout, invalid/unverified users, owner revocation, draft visibility, event publish/archive, same-day gigs, edit conflicts, history and direct API requests. Test in iOS Safari, Android Chrome and desktop, including expiry/refresh and recovery. Do not test by publishing fabricated gigs to production.

## Local verification

- `npm run test:studio-db`: disposable PostgreSQL 17 container; no network or host port exposure, no real accounts/records. Applies a minimal test Auth/role contract, the actual migration, seed and executable SQL assertions. Container is removed afterwards. This tests PostgreSQL schema/RLS/trigger behavior, not Supabase JWT signature validation, hosted session revocation or PostgREST.
- `npm test`: owner authorization and API fixtures, field validation and public event projection/outage cases, plus existing Brevo/catalogue tests.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`: public regressions and Studio fail-closed/browser boundaries.
- Supabase packages are pinned with the lockfile. Official current SSR/Auth documentation was consulted through the connected documentation tool; direct changelog retrieval was blocked by network policy.

## Remaining before a production Studio launch

Media storage/uploads and rights checks, release/video/gallery editing, enquiries with private storage/workflows, fans/consent/campaigns, custom commerce, owner MFA/challenge and tested account recovery, shared rate limiting, hosted integration tests, operational monitoring, backup/restore and final launch approval remain outstanding. The current limiter is per-process and is not adequate for a multi-instance public launch.

Before production, agree retention/backup procedures and demonstrate restore against an isolated project. To revoke access immediately, deactivate the owner membership through trusted administration and revoke its provider sessions; do not rely on deleting a user to invalidate tokens. Preserve audit history. Any rollback must account for database content changes; do not blindly replace managed events with old static listings.

## Verification record — 23 October 2026

TypeScript, ESLint, production build and 63 unit tests passed. All 45 existing public-site browser regressions passed; both new Studio browser boundary checks passed after correcting same-origin validation for Next.js proxy host normalization. The checks reject untrusted forwarded-host headers. The disposable PostgreSQL migration/RLS/history/version/revocation suite passed. Production dependencies reported zero known vulnerabilities via `npm audit --omit=dev`. No real auth account, message, subscription or hosted database was created by these tests. Live Supabase authentication/PostgREST, MFA and physical-device tests remain unverified.
