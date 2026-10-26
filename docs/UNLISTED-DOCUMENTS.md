# Unlisted partnership and investor documents

`/partnership` and `/investor` rewrite to standalone HTML documents in `public/documents`. This preserves the supplied slide deck, calculator scripts and styles without loading the public site shell or music player. Embedded photographs are extracted byte-for-byte into shared local assets; no document content or financial assumptions are rewritten. The investor's existing partnership proposal link now targets `/partnership`.

Both documents have a Home link to `/`, robots noindex/nofollow/noarchive metadata and matching X-Robots-Tag headers (including direct document/asset URLs). Neither route is in public navigation, page configuration or sitemap. These are public unlisted documents, not authenticated or confidential storage. Anyone with either URL can view or forward it.

Verification: TypeScript, ESLint and production build pass. Chromium checks at 1440px and 390px confirm HTTP 200, noindex headers, images loaded, no JavaScript errors, no horizontal overflow, working partnership slide navigation, investor range/reset controls and Home navigation. Original documents remain in the user's uploaded files.
