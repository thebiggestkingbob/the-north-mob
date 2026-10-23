# Visualz — six-video YouTube gallery

Implements the supplied six-video brief as an update to `/visuals`. Keeps the existing VISUALZ heading, photo archive, header/footer, navigation, other pages and shared Spotify engine. The curated gallery supersedes the previous local-film/reel presentation as requested; the original film asset remains available to Home.

## Source order

1. https://www.youtube.com/watch?v=s3Y4eAtF8jw
2. https://www.youtube.com/watch?v=UzOfwM3Ea6A
3. https://www.youtube.com/watch?v=XtGEewRFFC4
4. https://www.youtube.com/watch?v=GAI2cugbQgI
5. https://www.youtube.com/watch?v=on_eg9HLysA
6. https://www.youtube.com/watch?v=3ClPThAQawM

All six IDs retain the exact supplied order. Metadata requests are confined to these IDs, use YouTube oEmbed with a timeout and cached results. Missing titles remain numbered labels rather than invented song names.

## Behavior

- Two equal columns above 800px, one column at smaller widths, 16:9 thumbnails.
- Actual YouTube thumbnail URLs, grayscale by default, 380ms colour transition and 1.015 scaling on hover/focus. Reduced motion disables transitions/scaling.
- Preconnect to `i.ytimg.com`, first two thumbnails eager/high priority, remaining images lazy; responsive sizes and YouTube CDN caching. Missing high-resolution thumbnails fall back to YouTube's standard thumbnail, then an explicit unavailable label. No substituted imagery.
- Official YouTube IFrame API loads only after selection. One privacy-enhanced embed, standard controls/fullscreen permission, loading indicator, timeout/provider-error handling and optional external fallback on error.
- Native modal dialog, Escape/backdrop/close handling, body scroll lock and focus restoration without scrolling. Closing destroys the active player. No automatic music resume.
- Existing `northmob:video-open` event pauses the shared soundtrack on selection and confirmed YouTube playing state. No changes to the Spotify engine.
- CSP permits the exact YouTube API script and player-script path, YouTube thumbnail host and its preconnect; existing no-eval restriction remains. The permission is included in the document policy so internal SPA navigation to Visualz also works.

API behavior follows the [official YouTube IFrame API reference](https://developers.google.com/youtube/iframe_api_reference), including ready/state/error events and `destroy()`.

## Verification limits

Direct access to the six watch URLs and oEmbed URLs was throttled by the research service. This environment's network policy also does not allow direct YouTube/thumbnail requests. Therefore actual titles, thumbnail availability, video ownership, embedding permissions and successful real streaming/fullscreen playback are not established here. The app handles those failures explicitly. No video is labelled confirmed blocked without an actual provider result.

Automated integration tests use visibly named provider fixtures; they verify our code's behavior, not actual YouTube playback. Final test results and preview metadata observations are recorded below.

## Verification record

- TypeScript, ESLint, production build and 78 unit tests passed.
- Full browser run: 64 passed, two failures found. The provider-error test needed a dialog-scoped alert locator; the missing-thumbnail test exposed a real pre-hydration image-error race.
- Fixed the image race by checking completed image dimensions after hydration, preserving fallback stage ordering. No unrelated production component was changed.
- Final targeted run: all nine gallery checks passed, covering four widths (1440/1024/768/390), 16:9/grid/order, real-image-element loading through fixtures, grayscale/colour hover and focus, no preloaded players, all six selections, one iframe, destruction/fullscreen permission, unchanged paused music, restored focus/scroll, restricted provider, blocked scripts, missing images and stalled initialization. Together with the passing other 58 checks, all 67 browser scenarios are covered.
- Actual streaming, native YouTube fullscreen interaction, live thumbnails and embedding restrictions remain unverified due to network restrictions. Automated tests do not establish those capabilities.
