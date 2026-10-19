# STEP 5 — Search coverage and English pronunciation aids

## Scope

- Shared Staff/Guest facility search indexes 26 publicly visible facility records in four languages.
- Indexed fields: names, localized descriptions/menu examples, addresses, opening/closing times, directions, publicly visible notes and curated keywords.
- Staff hotel-English scripts separately index titles, bilingual customer questions, immediate answers, detailed answers, and approved search keywords. Internal staff checks are **not** indexed.
- Search matches all user terms (AND); configured synonyms are allowed alternatives (OR for only that term). No cloud API, auto translation or semantic/fuzzy external service.
- The search matches English letter case, NFC/NFKC Unicode normalization, punctuation and spaces **within each indexed field** while preserving the original facility list order.
- Explicit English/romanized brand aliases were entered for all 26 facilities, including Starbucks, Burger King, The Malt House, Mom's Touch, G Tower and West Boathouse.
- Data visibility and category filters remain enforced; unpublished data cannot become searchable.

## Keyword acceptance checks

| Query | Expected relevant examples |
| --- | --- |
| 맥주, 호프집, 맥줏집, 술집 | 더몰트하우스, 버거룸181, 플레이그라운드 브루어리, 금별맥주 |
| 커피숍, coffee-shop, coffeeshop | 컴포즈커피, 할리스, 스타벅스 |
| 고깃집, 갈비 | 한양, 경복궁 |
| 중국음식, 짜장면 | 팔진향 |
| 쭈꾸미 | 송쭈집 |
| 와사비, 김밥 포장 | 오토김밥 |
| Burger King, burgerking | 버거킹 |
| ＳＴＡＲＢＵＣＫＳ | 스타벅스 |
| 현프아, 현대 프리미엄 아울렛 | 현대프리미엄아울렛 송도점 |
| g-tower | G타워 |
| 맥주 약국 / 낙지 | 관련 정보가 없는 경우 결과 없음 (억지 유사 검색 금지) |

## Staff pronunciation

Staff-only English content displays a limited set of Korean phonetic aids inline next to known difficult expressions (for example coastal → 코스털, observatory → 업저버토리, brewery → 브루어리, reception → 리셉션, delivery → 딜리버리). Each text block shows at most 3 annotations to avoid crowding. Words matched inside longer unrelated words are not annotated.

These are Korean approximate reading aids, not guaranteed native pronunciation transcriptions. They should be reviewed by a bilingual hotel staff member before external operational use.

**Clipboard integrity:** `joinEnglishPhrases` and `copyText` always use the original English phrase strings; phonetic aids appear only in rendered staff UI. The guest-facing multi-language facility descriptions contain no phonetic decoration.

## QA and controls

- STEP 5 regression file: `scripts/step05-search-reading.test.ts`.
- Test coverage: all 26 venues, language-independent matching, aliases, punctuation, Unicode, OR synonyms + AND query, category/visibility exclusions, no broad false matching, word boundaries and byte-for-byte English phrase preservation.
- Localized Guest search hints and Staff facility/front-desk search hints now describe actual supported fields.
- `main` has not been modified, no production publication or public Pages deployment. Existing STEP 1–4 changes are preserved on the draft PR branch.
- STEP 6: test Staff/Guest on PC and mobile, keyboard/selection behavior, actual word visibility, pronunciation legibility, 4-language text spacing and customer copy actions before deployment.
