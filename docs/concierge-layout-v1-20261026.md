# Concierge Layout V1 · 2026-10-26

## Scope

Layout-only trial following the approved mobile guest + desktop staff visual sketch. Existing blue/navy palette, logo, published datasets, 4-language copy, hotel policy, Maps URL validation, English clipboard, request handoff, DEMO gate and admin tool are unchanged.

- Guest: replace plain greeting with a photo-led hero; position hotel information search above the prominent no-smoking notice; display short essential information cards from current hotel.json; keep the same hotel-category detail and full text; place one featured Songdo Timespace card ahead of the standard facility categories/search/results.
- Staff: compact photo-led heading, working hotel/facility shortcuts, quick hotel facts and one featured Timespace record. The actual hotel English responder, result/detail behavior and exact category tabs remain untouched.
- Featured card links use the existing facility ID `songdo-timespace-complex` and `naverMapUrl`, not a duplicate record. The Naver route currently ends at Starbucks Songdo Castle Park, not Timespace: its clarification is displayed from the original four-language facility data. No walking time invented.

## Change images and styling later

- Existing theme and logo: `src/styles/tokens.css` and `public/hotel-logo.webp`.
- Layout-only overrides: `src/styles/concierge-layout.css`, imported after the existing guest/staff styles by `src/index.css`.
- Photo paths: `src/components/ui/ConciergeHero.tsx` exports `CONCIERGE_IMAGES`; replace `public/concierge/frontdesk-concept.webp` and `public/concierge/timespace-concept.webp` with approved, optimized files at the same paths (or change only the two paths) to refresh without touching React data or logic.
- The interim photos are low-resolution crops of an AI-generated *visual sketch* supplied earlier in the project conversation. They are **not verified photos of the real hotel reception or Timespace** and must be replaced or clearly treated as illustrations before an approved public hotel launch.
- Quick facts come from `hotel.json` (check-in/check-out, adult breakfast Korean source text, Korean hotel notes phone); if the data omits a value, the fact is hidden or shown as unavailable rather than fabricated. Do not manually adjust prices in a graphic.
- No changes were made to verification dates, DEMO status, or production release gating.

## Required QA

`npm run test`, `npm run lint`, `npm run build`, `npm run test:ui` (Chromium in workflow), and public Pages/portable test builds. QA verifies both imagery files load, responsive page has no horizontal overflow at 320/390/768/1280, facts show hotel-approved price, and existing hotel guest and staff functionality still pass.
