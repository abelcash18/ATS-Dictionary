# DictionaryApp Modernization TODO

## Plan (confirmed)
- Modernize `index.html` structure and accessibility
- Refactor `dictionary.js` to modern async/await + safe DOM rendering
- Improve `dictionary.css` with modern focus/typography/accessibility touches
- Fix PWA assets + offline fallback in `service-worker.js` and `manifest.json`
- Remove AMP ad elements (not necessary per confirmation)

## Steps
1. Update `index.html` (remove AMP tags, add form submit handling, main/landmarks, aria-live).
2. Refactor `dictionary.js` (async/await, AbortController, DocumentFragment rendering, safer audio handling, install prompt cleanup).
3. Modernize `dictionary.css` (CSS variables, :focus-visible, prefers-reduced-motion).
4. Fix PWA:
   - Ensure referenced icons exist and update `manifest.json`.
   - Update `service-worker.js` caching list and add an `offline.html` fallback (create if missing).
5. Run a quick build/syntax check (at least open page in browser) and validate offline caching references.

