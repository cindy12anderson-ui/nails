# Nails&Gel booking demo: QA report

Date: 29 Sep 2026 (the demo's fixed "today" is Mon 28 Sep 2026)
Scope: `index.html`, `artifact.html`, `assets/app.js`, `assets/style.css`, `assets/img/`
Tools: Playwright (Chromium 1194), axe-core via `axe-playwright-python` 0.1.8, Pillow, node 22. The page was served over `python3 -m http.server`.
**Lighthouse was skipped**: the CLI isn't installed in the sandbox. Google Fonts are blocked here, so every run and screenshot uses the fallback fonts.

## Summary
| Area | Issues found | Fixed | Open |
|---|---|---|---|
| Functional / bugs | 4 | 4 | 0 |
| Data integrity | 0 (21/21 items match) | – | 0 |
| Security | 2 (1 hardening, 1 RFC compliance) | 2 | production items below |
| Performance | 2 | 2 | 2 notes |
| Accessibility | 4 (7 target-size spots) | 4 | 0 |
| Client change request (masthead subtitle) | 1 | 1 | 0 |
| **Total** | **13** | **13** | |

Final automated results:
- Functional suite: **1091 checks, 0 failures**, on mobile (375×812, is_mobile, has_touch, iPhone UA), desktop (1280×900) and `artifact.html`.
- axe: **0 violations** (WCAG 2.0/2.1/2.2 A+AA plus best practice) on every step, light and dark, at 375 and 1280, including error states, the open sheet and the card form.
- **0** console errors, page errors or CSP violations.
- **0** horizontal overflow at 320, 360, 375, 414, 768 and 1280.
- **0** tap targets under 44 px.
- **0** bytes in localStorage, sessionStorage or cookies.
- `node --check assets/app.js` passes.

## Tests run
1. **Full booking flow** (scratch script `flow.py`), 13 bookings × 2 viewports:
   - Services covered: Manicure (express, monthly, biting, removal, hard via "full menu"), Pedicure (1+1, all four deluxe tiers), Mani + Pedi (BIAB package, Kids, Hard Gel package via "full menu").
   - Every tier books its own id, name, duration, card price and cash price, and focus stays on the tier radio.
   - "Any available" and each named technician.
   - Weekday and weekend dates, checking the "10% weekend surcharge" in the summary and bar.
   - Month navigation: previous is disabled in Sep 2026, and no day ≤ 28 Sep or any Monday is enabled in Sep or Oct.
   - Continue is blocked without a date or time, with a message.
   - Add-ons appear in the summary and are kept after going back.
   - Details:
     - An empty submit shows all 7 errors (4 fields + 3 required confirmations), with `aria-invalid` and `aria-describedby`, and focus on First name.
     - With a bad phone or email, focus goes to the phone field.
     - With only the refund confirmation missing, focus goes to it.
     - Optional boxes (cancellation, late, SMS/terms, first visit) left unticked still pass. This matches the README (deposit, double-checked and refund are required).
   - Payment: Apple Pay, Google Pay, and card with empty-field errors, formatting and the name prefilled.
   - Confirmation: text, progress bar and sticky bar hidden.
   - **.ics**: CRLF only, no line over 75 octets, DTSTART/DTEND in `TZID=Australia/Melbourne` including add-on minutes, and `,` and `;` escaped in SUMMARY, LOCATION and DESCRIPTION.
   - Back navigation at every step (list ← tech ← time ← details ← pay, plus the recap "Change" link), with state kept.
   - "Book another": back to home, summary, bar, tier, technician, date, month, add-ons, fields, checkboxes and errors all reset.
   - Phone input accepts `+61 412 345 678`, `+61412345678`, `61 412…` and `0412 345 678`, each normalised to `412 345 678`.
2. **Keyboard only** at 1280 and 375:
   - The skip link moves focus to `main`.
   - Tab, Enter, Space and the arrow keys work through category, tier (arrows), technician, month, day, slot, add-on, Continue (the sticky bar on mobile), form, confirmations, Enter-to-submit in the email field, Google Pay, Add to calendar (download starts), Book another, the desktop progress back-button, and on mobile the sheet (opens on Close, Esc returns focus to the bar).
   - Focus is visible on every stop.
3. **Reviews carousel**: prev is disabled at the start, next at the end, both directions reach the end (4 presses on mobile, 2 on desktop), and focus is kept.
4. **Overflow**: every step (and the full menu) at 320, 360, 375, 414, 768 and 1280, measuring `scrollWidth` and any element wider than the viewport.
5. **Target size**: every visible `a`, `button`, `input`, `select`, `summary` and `label.check` at 320, 375 and 1280 on every step.
6. **axe-core**, as above. Colour contrast was also computed from the design tokens (below).
7. **Security**:
   - Sink review of `app.js`.
   - Payloads (`<img src=x onerror=alert(1)>`, `"><svg onload=…>`, `'; alert(1); //`, `</script><script>…`, `javascript:`, a 5000-character string, emoji plus full-width letters plus Korean) in the name, phone, email and card fields, carried through payment, back and confirmation.
   - Listened for dialogs, injected nodes, navigation and CSP violations.
   - Checked that the CSP is enforced: an injected inline `<script>` and a `data:` image are both blocked.
   - Storage and cookie check.
8. **Performance**: the Performance API (navigation timing, FCP, long tasks, layout shift), transfer size per request, `currentSrc` and natural size against rendered size for every image at 1x, 2x and 3x.
9. **Data integrity**: node extracted `CATS`, `ADDONS` and `TECHS` from `app.js` and diffed them against `content/acuity-content.md`.
10. **Cross-context**: `artifact.html` was regenerated from the `<!--BODY-->` block of `index.html`, checked to contain identical markup, and run through a full mobile booking inside a host-style wrapper (doctype, charset and viewport).
11. **Reduced motion**: with `reduce`, there are no animations and `scroll-behavior:auto`. With `no-preference`, the animations run and there are no errors.

## Issues found → fixed
| # | Area | Issue | Fix (file:line) |
|---|---|---|---|
| F1 | Functional (mobile) | The sticky bar, which holds the only Continue on phones and tablets, slid away whenever **any** text field had focus. After an empty submit, focus moves to the first error, and with a hardware keyboard or iPad there's no on-screen keyboard at all. In both cases the user was left with no Continue button. | The bar now hides only when the visual viewport actually shrinks (keyboard up), with pinch-zoom excluded: `app.js:700-715` (`kbSync`, `TYPING`, `visualViewport` resize). |
| F2 | Functional / RFC 5545 | .ics DESCRIPTION lines were 100+ octets and unfolded (RFC 5545 §3.1 limits lines to 75 octets). `icsText` escaped `\n` but not `\r`. | `icsFold()` folds at 75 octets without splitting UTF-8 characters, `icsText` handles CR/LF, and the Blob is `text/calendar;charset=utf-8`: `app.js:573-580, 598`. |
| F3 | Functional | The calendar event ignored add-on time: with "Removal: another salon's extensions" (+15 min), the event ended 15 minutes early. Chosen add-ons weren't mentioned in the event. | Added `min` to each add-on (`app.js:124-127`). DTEND now adds it (`app.js:583-584`), and DESCRIPTION lists the add-ons, escaped (`app.js:596`). |
| F4 | Functional | Pasting or autofilling `+61 412 345 678` produced `614 123 456` (a wrong number that failed validation). | The 61 country prefix is stripped when there are more than 9 digits (AU national numbers never start with 6): `app.js:684`. |
| F5 | A11y (keyboard) | Reviews carousel: at the last or first card the focused button disabled itself, and focus fell back to `<body>`. | `rvSync` passes focus to the other button: `app.js:329-338`. |
| F6 | A11y (screen reader) | Month change wasn't announced: the `aria-live` month heading is re-created on each render, so it never speaks. | The ineffective `aria-live` was removed, and `announce("October 2026")` added: `app.js:296, 647`. |
| F7 | A11y (axe `region`) | `.bar-due` ("Due today $30") sat outside any landmark. | `#bar` is now `role="region" aria-label="Current booking"`: `index.html:55`. |
| F8 | A11y (target size ≥44 px) | Compact wordmark 147×34 on every inner step below 920 px; calendar days 42×42 at 320 px; "Read all reviews on Google" 43 px; footer address link 42 px; the Instagram link on Monthly design 43 px. | Wordmark `padding-block:5px;margin-block:-5px` (same layout) at `style.css:83`. `.grid7{margin-inline:-10px}` at ≤359 px, giving 44.6 px days (`style.css:484`). Link padding at `style.css:200, 210, 240`. |
| S1 | Security | The CSP was `default-src 'self'` with `img-src … data:`, but nothing uses `data:` and nothing needs fetch, frames, media or workers. | Tightened to `default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'` at `index.html:6`. 0 violations across all flows, and enforcement verified. |
| S2 | Security / RFC | .ics text escaping and folding (same fix as F2). | See F2. |
| P1 | Performance | The 560 px photos were used for 96 px thumbnails (about 2× what a 3x iPhone needs) and 120 px ones. | Added 288 px copies (`*-288.jpg`, 12–19 KB each, versus 29–46 KB) and `srcset`/`sizes` for thumbnails and the summary image (`app.js:25-38, 181-190, 238`). Category arches keep the 560 px originals, since they need about 351 px at 3x. |
| P2 | Performance / hygiene | `biab-chrome.jpg` and `biab-manicure.jpg` (92 KB) weren't referenced by `index.html`, `app.js` or `style.css`. | Deleted. The README was updated. |
| A1 | UX (minor) | "Book another" or the wordmark reset scrolled to the progress bar, leaving the masthead off-screen. | Home now scrolls to the top: `app.js:505`. |
| C1 | Change request | Put "Korean hard-gel specialists" back into the masthead. | Added `<p class="subtitle">` after the tagline (`index.html:35`): serif italic, 17 px, muted (6.47:1), `style.css:77`. It's hidden on the compact inner-step masthead below 920 px (`style.css:84`). The duplicates were removed from the home lede (`app.js:347`) and the footer. The meta, og and JSON-LD text is kept. `artifact.html` was regenerated. |

Harness notes (not app defects): Playwright treats `aria-disabled="true"` buttons as disabled, so those clicks were forced. `artifact.html` has no viewport meta by design (the host supplies the skeleton), so the test wraps it the way the host does.

## Data integrity (app.js versus acuity-content.md)
All **21 bookable items** match on name, duration and card/cash price. That's 11 manicure, 2 pedicure plus the 4 deluxe tiers, and 3 packages plus Kids. So do the 4 add-ons (+$2 each/+5 min, free/+5 min, +$3 each/+15 min, +$25) and the 3 technicians' titles and years. Nothing was changed.
- *BIAB Mani + Pedi: 15 min* matches Acuity. It stays flagged "duration to confirm" (probably 1 h 15 min).
- *1+1 Deluxe Pedicure* is cash-only, $184 for two, as in the source.

## Security review
- **Sinks**: `innerHTML` is used in `summary()`, `progress()`, `render()`, `openSheet()` and the tier re-render, only with static data from `app.js`. No `insertAdjacentHTML`, `outerHTML`, `document.write`, `eval` or `new Function`. Name, phone, email and card go in only through `.value`, and the bar uses `textContent`. Attribute values built from data go through `esc()`. All payloads rendered as inert text: no dialog, no injected node, no CSP report.
- **Links**: all 6 `target="_blank"` links (footer ×2, reviews, Instagram, directions, map) have `rel="noopener noreferrer"`.
- **Forms**: both forms are `novalidate` and a global `submit` listener calls `preventDefault`. `form-action 'none'` is a backstop. The URL never changed during any test.
- **Secrets**: none (grep for key, token, secret and password). The Apple Pay and Google Pay buttons are simulated.
- **Storage**: nothing stored (localStorage 0, sessionStorage 0, cookies empty, no IndexedDB use). Card data is never put in state.
- **Accepted for the demo**: the email regex is permissive (for example `x@y.co<script>` passes). It's harmless here because it's only ever `.value`, but the server must validate. The **README now has a "Security notes" section** covering HTTPS/HSTS, server-side validation, Stripe/Square tokenisation (SAQ-A), Apple Pay domain verification, rate limiting and reCAPTCHA, and host headers (CSP with `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP).

## Performance results (local server, sandbox CPU)
| | 375 @3x | 1280 @1x |
|---|---|---|
| DOMContentLoaded / load | 48 ms / 56 ms (baseline 90 / 105) | 55 ms / 86 ms (baseline 75 / 84) |
| First contentful paint | 36 ms | 96 ms |
| Long tasks | 0 (baseline had one 56 ms task during the first render) | 0 |
| Cumulative layout shift | 0 | 0 |
| Home: requests / transfer | 6 / 179 KB | 6 / 179 KB |
| Full menu scrolled: requests / transfer | 18 / 359 KB (about 413 KB before) | same |

- **Text assets**: `index.html` 5.0 KB (1.9 KB gzip), `app.js` 54.0 KB (19.0 KB gzip), `style.css` 33.6 KB (8.3 KB gzip).
- **Images**: 19 files (13 photos plus 6 thumbnail copies), 403 KB on disk. Every `<img>` has width and height. Category images and the first two service cards are eager, everything else is `loading="lazy"`, and all use `decoding="async"`.
- **Render-blocking**: the script is `defer` in `index.html` and at the end of the body in `artifact.html`. The only blocking resources are `style.css` and the Google Fonts stylesheet.
- **Notes (not changed)**:
  1. The Google Fonts CSS is a cross-origin render-blocking request. For production, self-host the two families (woff2, `font-display:swap`, preload the display face). That also removes the Google origins from the CSP.
  2. Minify JS and CSS and serve them with Brotli and long-cache immutable hashed filenames. The 353–384 px photos weren't resized, since the gain at 3x would be about 20%.

## Accessibility results
- **axe-core**: 0 violations after the fixes (1 best-practice `region` issue before).
- **Contrast** (from tokens, WCAG 2.2):
  - Light theme, text: ink 14.8:1, muted ≥4.9:1, accent ≥4.5:1 (on the blush and surface backgrounds that text actually sits on), warn ≥5.4:1, error ≥5.4:1, ok ≥4.9:1. Rose is 4.5:1 on surface and is used only for large or decorative glyphs.
  - Light theme, non-text: field borders ≥3.2:1.
  - Dark theme: all text is ≥7.3:1 and borders are ≥3.7:1.
  - Google Pay text is 10.5:1.
- **Focus**: a 2 px ink outline on every stop was confirmed in the keyboard run. Tier radios and checkboxes show the ring on the label or box.
- **Labels**: every input has a `<label>`. Errors are linked through `aria-describedby` and `aria-invalid`. The required mark is explained ("Fields marked * are required").
- **Live regions**: `#live` (polite, atomic) announces each step, date (with the number of times available), time, tier, month (new), errors and the calendar download. Focus moves to the `<h1>` on every step change.
- **Targets**: all are ≥44 px at 320, 375 and 1280, except the inline "Change" link inside the recap sentence (the WCAG 2.5.8 inline exception).
- **Inputs**: all are 16 px, so iOS doesn't zoom on focus. Autocomplete tokens are set.
- **Reduced motion**: every animation and smooth scroll sits inside `prefers-reduced-motion: no-preference`, and the JS checks `reduced()` before smooth scrolling (verified both ways).

## Screenshots
`screens/` was regenerated: 35 PNGs at @2x, 18 at 375 (`m375-*`) and 17 at 1280 (`d1280-*`). They cover the home page (plus full page), reviews (plus after next), Manicure list, card details open, Deep tier, Mani + Pedi, technician, date/time empty and selected (weekend plus add-on), the mobile sheet, details empty, with errors and filled (Korean name, pasted +61 number), payment and card form, and confirmation. They show the fallback fonts because Google Fonts are blocked in the sandbox.

## Remaining risks and production requirements
1. **Everything simulated must become server-side**: Acuity availability and booking creation, with the slot re-checked and prices re-read on the server; the payment provider's hosted fields and wallets (`DEMO=false`, Apple Pay domain verification); and Google Places reviews fetched on the server. See "Security notes" in the README.
2. **Host headers**: `frame-ancestors`, HSTS, `nosniff`, `Permissions-Policy` and COOP can't be set from a meta tag. The artifact host applies its own CSP, so `artifact.html` relies on it.
3. **Real iOS Safari check**: the keyboard-aware bar (`visualViewport`) and the `<dialog>` sheet were tested in Chromium mobile emulation only. Verify them on a device, especially with iOS autofill of phone and email.
4. **Month navigation** has no upper bound. Acuity's booking window should cap it when live data is connected.
5. **Open content questions** in the README (BIAB Mani + Pedi duration, deposit surcharge maths, opening hours and others) are unchanged. The .ics uses Acuity's 15 minutes for BIAB Mani + Pedi until that's confirmed.
6. Lighthouse wasn't run (not available). Run it on the deployed HTTPS build, along with a WebPageTest run on a mid-range phone over 4G.
