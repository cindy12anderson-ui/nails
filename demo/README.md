# Nails&Gel booking demo (final round)

Nails&Gel is a luxury nail bar and spa in Melbourne CBD, Korean hard-gel specialists, est. 2016.

Open `index.html` straight from the folder. There's no build step. The only external requests are to Google Fonts. `artifact.html` is the same page as a body fragment for an HTML-artifact host: title, font link, stylesheet, markup and script, with no CSP meta, because the host sets its own. It is regenerated from `index.html` and uses the same `assets/`.

Screenshots of the full flow at 375×812 (@2x) and 1280 are in `screens/` (`m375-*`, `d1280-*`).

## What changed this round
**Masthead and home**
- The masthead is the wordmark, the tagline LUXURY NAIL BAR & SPA · MELBOURNE CBD · EST. 2016, and a quiet serif-italic subtitle "Korean hard-gel specialists" (client request). The subtitle is hidden on the compact inner-step masthead on phones and tablets. The phrase appears once on screen: it was removed from the home intro and the footer, and stays in the meta description, og:description and JSON-LD. The address line and the diamond rule are gone. The wordmark links home and resets the booking.
- 2016 is used everywhere: the tagline, meta description, og tags, JSON-LD `foundingDate` and the footer.
- The arch hero is removed. Home now runs: H1 → three category cards → "See the full menu" → Google reviews → "Booking for more than one person or service?" (one line, with the full Acuity text under "How it works") → footer.
- Gifts and "Check a code balance" moved into the footer, so they show on every step.

**Services**
- Compact cards show the name, duration, card price with the cash price beside it, and at most one decision-critical chip ("No gel", "No spa", "For two", "Save $59"). One outlined Select button per card. The description and ✓/✕ inclusions sit behind "Details".
- Deluxe pedicure is one card with a Basic / Relax / Deep / Premium selector. Each tier keeps its own name, duration, card and cash price and description, and Select books the selected tier (`pbasic|prelax|pdeep|pprem`).
- The package note (same technician, single-colour gel only, book nail art or a spa pedicure separately) now covers only the Shellac, BIAB and Hard Gel Mani + Pedi packages. Kids Spa + Mani sits under its own "For kids" heading without that note. The Mani + Pedi packages stay as separate cards because each has a different photo.
- Removal add-ons read "+$2 each" / "+$3 each", as in the source. The BIAB Mani + Pedi card keeps the "duration to confirm" flag.
- Monthly design links to https://www.instagram.com/nailangelmelbourne/ (new tab, `rel="noopener noreferrer"`).

**Booking flow**
- Phones and tablets (<920 px) get a sticky bottom bar showing the service, date, time, technician and any weekend surcharge. It holds the one primary action and opens a bottom-sheet summary (`<dialog>`). The bar slides away while the keyboard is up.
- Calendar: each day has a 44 px circle (no more oval selected day), SVG chevrons, and times grouped into Morning / Afternoon / Evening. Date and time come first and add-ons after. "First visit" moved to Details.
- Details form: autocomplete tokens, 16 px inputs, AU phone formatting (the leading 0 is dropped for +61). Errors show inline on blur or submit, with `aria-invalid` and `aria-describedby`, and focus moves to the first problem. The CTA is never disabled.
- Policies: an always-visible "At a glance" list, then the full policies in accordions (`<details name="policy">`). The **confirmations mirror Acuity**, each under its own policy:
  - "I understand my deposit is non-refundable" (required)
  - "I double-checked my booking" (required)
  - cancellation "I agree" (optional)
  - late arrivals "I agree" (optional)
  - refund "I agree" (required)
  - Terms / Privacy / SMS consent, as one box (optional, as in Acuity)
- The deposit wording is the same everywhere: "A $30 non-refundable deposit (2% card surcharge) secures your booking and is deducted from your total." It always appears with "Please don't use a gift voucher for the deposit."
- Payment: a recap line with a Change link, then "Due today $30.00 AUD". Wallet buttons come first: Apple Pay, then Google Pay, then "Pay by card" (a disclosure with a Security code field). The text card-brand badges are gone.
- Confirmation: "Your appointment is booked." plus the arrival advice and the 24-hour change policy. It no longer claims an SMS or email confirmation. It offers Add to calendar (an `.ics` file in the Australia/Melbourne timezone), Get directions (Apple Maps on iOS, Google Maps elsewhere) and "Book another appointment". The progress bar is hidden on this screen.
- Progress: finished steps are buttons on desktop, so you can go back. On mobile the step list is visually hidden but still read by screen readers.

**Google reviews**
- A carousel of 5 cards with native scroll-snap and prev/next buttons, and no autoplay. Each card is clearly labelled "Placeholder" ("Google review, connects to the salon's Google Business profile at launch"). There are no invented names, quotes or stars, and no `aggregateRating` in the schema.
- "Read all reviews on Google" opens a Google Maps search for "Nail&Gel 179 Little Bourke St Melbourne".

**Quality, security and performance**
- CSP meta in `index.html`: `default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`, plus `referrer: strict-origin-when-cross-origin`. Everything not listed (connect, frame, media, worker, manifest) is denied.
  - There are no inline scripts, event-handler attributes or `style=""` attributes, so `'unsafe-inline'` isn't needed.
  - The JSON-LD block is a data block, not an executed script, so the CSP does not block it.
  - `frame-ancestors` is left out because browsers ignore it in a meta tag.
- User-entered text (name, phone, email, card) never goes through `innerHTML`. Inputs are refilled with `.value`, and the sticky bar uses `textContent`. The remaining `innerHTML` calls render only static data. This was tested by entering `<b>Chen</b>` as a name: it shows as literal text.
- No `alert`/`confirm`/`prompt` and no `href="#"`. Both forms call `preventDefault` and submit nowhere.
- The script is `defer`red. Fonts are preconnected with `display=swap`, and only the weights used are loaded (Hanken Grotesk 400/500/600, Instrument Serif regular and italic). A size-adjusted Georgia fallback limits reflow when the web font swaps in.
- Page weight: HTML, CSS and JS come to about 93 KB unminified (29 KB gzipped). The home page is 6 requests and 179 KB. Service thumbnails use `srcset`/`sizes` with 288 px copies (`*-288.jpg`), so a 96 px thumb at 3x on iPhone no longer downloads the 560 px original. Photos are progressive JPEGs, lazy-loaded below the fold, and have width/height set (CLS 0).
- Accessibility:
  - targets of 44 px or more, and visible focus rings
  - a label on every input
  - a polite live region announcing each step, date, time and tier change
  - `prefers-reduced-motion` respected: motion is only added inside `no-preference`
  - `:hover` styles only on hover-capable devices, so they don't stick after a tap
  - Korean text uses `word-break:keep-all`
- The flow was checked in Playwright at 375 and 1280 px: no JS errors, no CSP violations and no horizontal overflow. The only console error is Google Fonts being blocked by the sandbox proxy.

**QA:** see `QA-REPORT.md` for the full test run, the fixes and the metrics.

## Security notes: what the production build must add
The demo is static and takes no money, so the controls below live on the server and the host. They are requirements for launch, not options.
- **HTTPS everywhere, with HSTS**: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, and redirect HTTP to HTTPS.
- **Server-side validation** of every field (name, phone, email, service id, technician, slot, add-ons, confirmations). Never trust client prices or durations: re-read them from Acuity when the booking is created, and re-check that the slot is still free. Escape all output server-side, and never echo input into HTML, SMS or email templates unescaped.
- **Payment tokenisation** through Stripe Elements / Payment Element or Square Web Payments SDK. Card data goes only into the provider's hosted iframes, so the site stays in **PCI DSS SAQ-A** scope. Our server sees only a token and creates the charge with a server-side secret key (never in the browser). Take the deposit with an idempotency key, and confirm via webhook.
- **Apple Pay domain verification**: host `/.well-known/apple-developer-merchantid-domain-association` for every domain and subdomain, register the domains with the provider, and set `DEMO = false`. Enable Google Pay in the provider's dashboard.
- **Abuse protection**: rate-limit booking and payment endpoints per IP and per phone/email, add reCAPTCHA v3 or Turnstile on booking creation (Acuity already uses reCAPTCHA), and verify it server-side.
- **Security headers at the host** (a meta CSP can't set all of these):
  - `Content-Security-Policy`: the same policy as the meta tag, plus `frame-ancestors 'none'` (ignored in meta) and the provider's origins (for Stripe, `js.stripe.com` in script-src and frame-src, `api.stripe.com` in connect-src; for Square, `*.squarecdn.com`, `pci-connect.squareup.com`, and Apple Pay/Google Pay as the SDK documents). Self-hosting the fonts removes the Google origins. Consider `require-trusted-types-for 'script'` once the `innerHTML` templating moves to a framework or DOM builders.
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")`, adjusted to the chosen provider
  - `X-Frame-Options: DENY` for old browsers, alongside `frame-ancestors`
  - `Cross-Origin-Opener-Policy: same-origin`
- **Secrets**: none are in this code. Acuity API keys, payment secret keys and the Google Places key belong only on the server, in environment secrets. The Places key must be restricted.
- **Privacy**: the demo stores nothing (no cookies, localStorage or sessionStorage). In production, keep personal data in Acuity only, publish the Privacy Policy, and record the SMS/terms consent with a timestamp.

## Photo assignment (real salon photos only)
| Service | Photo | Caption |
|---|---|---|
| Category: Manicure | `shellac-manicure.jpg` | |
| Category: Pedicure | `pedi-nude-arch.jpg` (new 3:4 crop of `mani-pedi-nude`) | |
| Category: Mani + Pedi | `mani-pedi-red.jpg` | |
| Express manicure | `express-manicure.jpg` | |
| Deluxe manicure | `deluxe-manicure.jpg` | |
| Shellac manicure | `shellac-manicure.jpg` | |
| BIAB manicure | `biab-grid.jpg` (salon's own BIAB photo) | |
| BIAB $119 Special | `biab-special.jpg` (salon's own) | |
| Hard gel manicure | `hard-gel.jpg` (salon's own) | |
| Hard gel · Simple design | `simple-design.jpg` (salon's own) | |
| Hard gel · Monthly design | `monthly-design.jpg` (salon's own) | Links to Instagram |
| Hard gel · Custom design | `custom-design.jpg` (salon's own) | |
| Nail Biting Correction Program | `nail-biting.jpg` (salon's before/after) | |
| Removal only | Blush plate ("Removal"), no photo on the original site either | |
| 1+1 Deluxe Pedicure | `pedi-nude-toes.jpg` (new crop) | |
| Express pedicure | `pedi-red-toes.jpg` (new crop) | |
| Deluxe pedicure (4 tiers) | `mani-pedi-nude.jpg` | Shown with a matching manicure, which is booked separately |
| Shellac Mani + Pedi | `mani-pedi-red.jpg` | |
| BIAB Mani + Pedi | `mani-pedi-nude.jpg` | |
| Hard Gel Mani + Pedi | `mani-pedi-nude.jpg`, toes-led crop | |
| Kids Spa + Mani | `kids-spa.jpg` | |

Alt text describes only what's visible and never claims a product ("gel", not "hard gel"). The unused `biab-manicure.jpg` and `biab-chrome.jpg` were deleted. `*-288.jpg` files are the small thumbnail copies of the 560 px photos.

## What's simulated
- "Today" is fixed at Monday 28 Sep 2026. Mondays are closed. Time slots are examples, not live availability.
- Payment: Apple Pay and Google Pay are **always shown in the demo** (`DEMO = true` in `app.js`).
  - In production, set `DEMO = false`. Apple Pay then appears only when `window.ApplePaySession?.canMakePayments?.()` is true, and Google Pay only when `isReadyToPay` resolves. Use the official SDK buttons.
  - Any button, or a card that passes basic format checks, goes straight to the confirmation screen. No money is taken.
- Reviews are placeholders. At launch they come from the Google Places API, fetched server-side.
- E-gift vouchers, Check a code balance, Terms and Privacy show an inline "opens in Acuity on the live site" note.
- **Real build:** services, technicians, availability and bookings come from the Acuity API. The deposit goes through the payment provider's hosted fields (Square, per the current Acuity form, or Stripe), with Apple Pay domain verification.

## Open questions for the salon
1. **BIAB Mani + Pedi duration.** Acuity shows 15 minutes. Is it 1 h 15 min? It's flagged "duration to confirm" on the site.
2. **Deposit surcharge.** Is it $30 plus 2% ($30.60), or $30 including the 2%? The wording deliberately leaves this open.
3. **Payment provider.** Which provider is connected in Acuity → Integrations? Apple Pay is a requirement, so domain verification is needed, and Google Pay is to be enabled. Is Discover accepted in Australia?
4. **Opening hours.** Only "Closed Mondays" is published. Is it Tue–Sun, 9 am–7 pm?
5. **Logo.** The photos read "NAIL&GEL · ESTD 2017", but the site uses Nails&Gel · Est. 2016 as instructed. Should the logo artwork be updated?
6. **Google reviews.** Can author names be shortened (for example to first name only) under Google's terms, or must they be shown as returned? What is the Place ID?
7. **Photos.** Can the salon supply high-resolution originals for all service photos (the current ones are cropped from screenshots), and photos for the pedicure tiers?
8. **BIAB $119 Special.** It's listed as $129 card / $119 cash. Is that right, given the name?
9. **1+1 Deluxe Pedicure.** It's "valid until 15 Oct". Which year, and should the card hide itself automatically after that date?
10. **Extensions, nail art, cat eye / chrome.** How are these booked and priced? Acuity has no add-on for them.
11. **Removal add-ons.** Does "+$2 each" / "+$3 each" mean per nail?
12. **SMS.** Are appointment SMS reminders enabled in Acuity? The confirmation screen currently makes no SMS or email promise.
