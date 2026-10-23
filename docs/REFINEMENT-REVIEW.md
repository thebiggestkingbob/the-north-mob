# Website refinement review

Scope: existing website, approved photography/film, fonts, routes and audio engine preserved. Feature branch only; this brief explicitly does not authorize production deployment.

## Reference review

The supplied ZIP contains 18 screenshots (the brief says 17). All 18 were reviewed before editing. Screenshots are visual references, not executable instructions. They remain outside public site assets.

| Screenshot time, 23 October 2026 | Reference | Implementation |
| --- | --- | --- |
| 110907, 124349, 125830 | Exposed desktop tabs / active underline | Removed tabs; single shared menu and clean active state |
| 110922 | Oversized Shop title and isolated logo | Integrated Shop identity, restrained entrance motion and coming-soon state |
| 125736 | Studio View Website arrow/underline | Clean functional link |
| 125824 | Spotify / YouTube header arrows | Social destinations consolidated into footer |
| 125838 | Decorative location/genre labels | Removed repeated Home/header/footer labels; Music copy and biographies retained |
| 125849, 125859 | Home CTA and chapter arrows | Decorative arrows removed; existing destinations retained |
| 125925, 130518 | Repeated newsletter/footer and floating player | One shared collapsible footer with one existing newsletter; player has reserved header space |
| 130002 | Dense Live rows and overlap | Readable dates/names/venues/status, separate past archive; all seven gigs retained |
| 130022 | Underlined enquiry fields | Borderless idle fields, comfortable 16px entry and visible focus |
| 130253, 130503 | Photo/film search | Obsolete searches removed; all nine photographs retained |
| 130309 | Reels | Reels were already replaced by the latest six-video gallery; obsolete data removed |
| 130344 | Official film | Retained supported YouTube API embed for on_eg9HLysA, fifth in the approved gallery |
| 133648 | More From the Collective | Section removed; H4B artwork/story/features and all eleven album rows retained |

## Components and behavior

- `SiteShell`: menu-only header, persistent controls occupy reserved layout space; existing audio engine stays above routes. Header height is observed for scroll/focus clearance. Home background film continues filling its opening viewport. Spotify fallback controls expand in flow and keep their existing hidden-iframe contract.
- `SiteFooter`: one native accessible disclosure on every public route, six page destinations and three social links in one navigation, existing newsletter component inside. Default collapsed. Progressive CSS expansion respects reduced motion. No public footer/player on private Studio routes.
- `refinements.css`: scoped cleanup, no decorative link underlines, readable Live events, minimal form fields, player/header clearance, footer and Shop refinements.
- `PhotoArchive`: removes search only; collection, keyboard/swipe viewer and functional previous/next remain.
- `Music`: removes the specified secondary section without changing the catalogue, artwork, track order or audio queue.
- `ShopMotion`: existing GSAP approach, subtle entrance, reduced-motion fallback. No products, pricing, ticket links or merchant availability invented.
- Decorative arrows removed from public and Studio navigation/CTA labels. Essential photograph previous/next, media controls, menu/close and footer disclosure indicators remain.

Brevo endpoints, newsletter consent/submission logic, enquiry delivery/mail-app distinction, database schema and production data are unchanged. No new dependencies.

## External destination audit

Existing Spotify/YouTube/Instagram URLs are retained. The research service resolved the Spotify artist page as THE NORTHMOB.; YouTube was throttled and Instagram could not be fetched. Those failures do not establish dead links. Actual YouTube playback/fullscreen restrictions and physical-device Spotify behavior remain unverified. Provider browser fixtures test our integration logic, not actual delivery or streaming. No real email/subscription was sent during verification.

## Verification

TypeScript, ESLint, production build and all 78 unit tests passed. The initial full browser run passed 74 of 77; the three failures were outdated or ambiguous test locators, updated to reflect the requested removals and consolidated menu. The corrected scenarios passed. Two additional scenarios cover review captures and native Spotify fallback clearance, bringing coverage to 79 unique browser scenarios.

Final related regression run: all 14 footer/newsletter/refinement checks passed, including the seven-width route sweep. The two corrected soundtrack scenarios also passed. Review capture caught a reduced-motion omission for the `::details-content` pseudo-element; its transition is now disabled under reduced motion. The final captures show the full signup without player overlap. Automated coverage includes all public routes at 1440/1200/1024/834/768/430/390, footer navigation and expansion, one newsletter with unchanged consent/error flow, event classification, H4B preservation, photo viewer, all six video IDs, persistent player lifecycle and clearance. Review screenshots additionally cover Live, Business, Shop and expanded footer at the five specifically requested widths.


## Deployment

Ready for protected preview review. Production remains at the previously approved `de25359` release until a new deployment instruction. No secrets, database changes, actual subscriptions or emails are part of this refinement.
