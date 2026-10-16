# Front desk scripts — Development 1

This stage adds **30 data records only**, in `src/data/frontdesk-scripts.json`.
No staff navigation, display, guest display, backend, live deployment access, or guest-facing sharing of these scripts has been added.

## Source and review

- `hotel.json` remains unchanged; its separately verified H01–H35 hotel copy is the reference source.
- `sourceType: "hotel-data"` points to a corresponding `sourceSection` of the original hotel copy.
- `sourceType: "user-provided"` with `sourceSection: null` is reserved here for the smoking area to the **left of the main entrance**, identifiable by a **silver ashtray bin**.
- All 30 entries are `reviewStatus: "draft"` and `lastVerifiedAt: null`. Draft means **the English wording and current operating terms still require hotel review**.
- A script may be `approved` only after a real verification date is recorded. Dataset `production` cannot contain drafts.
- Rates, timing, pet/ID policies, and fire-alarm guidance are candidate responses only; staff must follow hotel procedures and current confirmation. Never interpret a real alarm as a drill without checking.

## Field contract

- `question` and `quickAnswer` require complete `{ en, ko }` pairs.
- `details` is an optional complete `{ en, ko }` pair. Do not pad simple answers with filler.
- `staffChecks` is a list of **staff-only operational reminders**, not guest dialogue and not to be included in the copied English response.
- `keywords` support the future bilingual search, including synonyms, without an AI service.
- `sourceType`/`sourceSection` record provenance; **they do not imply independent external verification**.
- The validator rejects unknown fields, malformed dates, missing translation pairs, duplicate IDs/keywords, and inconsistent approval status.

## Next stage

In Development 2, add staff-only script search/filter/detail and separate copying of the quick and optional detailed English. Keep `staffChecks` visually isolated, and do not expose them in the guest-facing screen.
This repository's public GitHub Pages/desktop test builds do not provide staff authentication; any information later bundled in frontend JavaScript may be inspected publicly. Never put internal credentials, private procedures, personal records, or confidential details into these JSON files.

Validation is wired into `npm run validate` and `npm run test`. Current guest and staff UI behavior remains unchanged.
