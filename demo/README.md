# Nails&Gel booking demo: "Maison, elevated"

Open `index.html` straight from the unzipped folder. There's no build step, and the only external request is Google Fonts. `artifact.html` is the same page as a body fragment for an HTML-artifact viewer, using the same `assets/`.

## Design direction
Quiet luxury with a blush tone. The framed "maison" card from Option B stays, now with a hairline double frame and small diamond ornaments. It sits on a blush-porcelain page with a soft rose wash at the top. The masthead is centred: a large "Nails&Gel" wordmark with an italic rose ampersand, a hairline rule, and the tracked tagline LUXURY NAIL BAR & SPA · MELBOURNE CBD · EST. 2017.

**The one wow moment:** the wordmark resolves slowly (fade and letter-spacing, 1.8 s) above an editorial hero of three arched photos of the salon's own work on a blush wash. With `prefers-reduced-motion`, nothing animates. The final state is always the resting state.

Arches repeat as the shape for the category cards. Services without a photo get typographic tiles: italic serif word plus a small caps label. Pedicure tiles show 1 to 4 dots for Basic → Premium, and Hard gel gets a dark "signature" tile.

## Type pairing
**Instrument Serif** (display, with a true italic for the ampersand) + **Hanken Grotesk** (text, 400/500/600). Why: a high-contrast, slightly condensed editorial serif reads as couture at large sizes, and a calm humanist grotesk keeps prices, forms and policies clear on a phone.
Fallbacks: Iowan Old Style / Palatino / Georgia, and system-ui / -apple-system / Segoe UI / Roboto / Arial (plus Apple SD Gothic Neo / Noto Sans KR for the Korean note).

## Palette (light), with WCAG contrast
| Token | Hex | Use | Contrast |
|---|---|---|---|
| bg | `#F5ECE8` | blush porcelain page | n/a |
| surface | `#FDF9F8` | card | n/a |
| blush | `#F2E3DE` | soft fills, selected states | n/a |
| ink | `#2A2322` | text, buttons | 13.3:1 on bg, 14.8:1 on surface |
| muted | `#6A5754` | secondary text | 5.8:1 on bg, 6.5:1 surface, 5.4:1 blush |
| accent | `#7A5A4E` | rose-brown labels, rules | 5.3:1 on bg, 5.9:1 surface, 5.0:1 blush |
| rose | `#9C6560` | ampersand, current step numeral, weekend dot | 4.5:1 on surface |
| field | `#927A75` | input and control borders | 3.4:1 on bg, 3.8:1 surface (non-text ≥3:1) |
| ok / warn | `#3E6B52` / `#8A4B2F` | included / not included chips | 5.9:1 / 6.4:1 on surface |

The dark theme (`prefers-color-scheme: dark`) uses ink `#F4EBE8` on `#161111`, and all its text pairs are above 7:1. Apple Pay switches to white on black, following Apple's guidelines.

## Accessibility
Every input has a visible label. There are visible focus rings and a skip button. Targets are at least 44 px. A polite live region announces each step change, and focus moves to the step heading. Every image has alt text, and decorative tiles are hidden from screen readers. Chips use ✓ and ✕ as well as colour. "Continue to payment" stays disabled, with a hint that lists exactly what's still missing.

## Photos
The photos were cropped from the salon's Acuity screenshots and saved to `assets/img/`: express, deluxe, shellac, BIAB (2×2 grid, plus its 4 tiles), red mani+pedi, nude mani+pedi, and kids spa.
The screenshots supplied don't contain photos for the BIAB $119 Special, hard gel, the design menus, nail biting or the pedicures, so those use typographic tiles until we get the originals.

## What's simulated
- "Today" is fixed at Monday 28 Sep 2026. Mondays are closed. The time slots are example times, not live availability.
- Payment (Apple Pay, Google Pay, card) goes straight to the confirmation screen, and no money is taken.
- E-gift vouchers, Check code balance, Terms and Privacy show an inline "coming from Acuity" note.
- **Real build:** services, technicians, availability and bookings come from the Acuity API. The $30 AUD deposit goes through the payment provider (Square, per the current Acuity form, or Stripe), with Apple Pay domain verification and Google Pay enabled.

## Open questions for the salon
1. **BIAB Mani+Pedi duration.** Acuity shows 15 minutes. Is it really 1 h 15 min? It's flagged "Duration to confirm" on the site.
2. **Deposit wording "$30 (2% card surcharge)".** Is it $30 plus 2% ($30.60), or $30 including the surcharge?
3. **Opening days and hours.** Is it Tue–Sun, 9 am–7 pm, closed Mondays?
4. **Brand name.** The site uses "Nails&Gel", but the logo in the photos reads "NAIL&GEL". Which is correct?
5. **Photos.** Can we have the original, full-resolution photos for every service, including the missing hard gel, design, pedicure and nail-biting images?
6. **1+1 Deluxe Pedicure.** It says "valid until 15 Oct". Which year, and should it disappear from the site automatically after that date?
7. **E-gift vouchers.** We need the product list and prices.
8. **Payment.** Which provider is connected in Acuity → Integrations, and can Apple Pay and Google Pay be turned on there?
