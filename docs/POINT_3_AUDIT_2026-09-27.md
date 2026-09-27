# NAHLATY — Point 3 Implementation Audit

Baseline: `living-visual-engine-v1` at `03c2cc526f7febc95107d76e9958c8d2664b59ac`, 2026-09-27. Scope: current repository and matching Vercel preview. Status: **Point 3 ✅ CLOSED as an inventory; capability gaps remain open in Points 4–15.** A green build is not proof that the complete product journey works.

## Evidence and method

- `npm run build`: 67/67 tests pass; Next.js production build succeeds on an isolated checkout.
- Production-server smoke: `NAHLATY_SMOKE_BASE=http://127.0.0.1:3011 node scripts/smoke-prod.mjs` passed; root and `/living-engine` served 200, engine self-test passed, curated heart returned ten stages and 20 heart image assets served 200.
- [GitHub CI run 36315386884](https://github.com/coantoai/NAHLATY_MY_BEE/actions/runs/36315386884) succeeded for the same commit; [Vercel deployment](https://vercel.com/coantoai-9460/nahlaty-my-bee/9ZtPsXRashxUy8X8Vnap2sxSDzL5) reported READY for that SHA.
- Browser opened the deployment's `/living-engine` route on 2026-09-27, observed a rendered page, entered «كيف يعمل القلب؟», and verified that «ابدأ الفهم» became enabled. The question was not submitted: full generation calls the paid Qwen image API, and existing spend against the $10 ceiling was not verified.
- This browser check proves initial rendering and input interaction only. It does not prove a generated image, semantic motion, follow-up continuity or archive recovery.

## Inventory

| Capability | Status | Evidence and limit | Next point |
| --- | --- | --- | --- |
| Build, unit tests and curated API smoke | WORKING (bounded) | 67 tests, production build and smoke passed. Smoke tests curated heart and HTTP, not a generated user journey. | 4, 12 |
| Cinematic heart storyboard | WORKING (curated) | Ten stages and 20 permanent assets; this is a subject-specific route, not any-question output. | 4, 6 |
| General question → scene graph | EXPERIMENTAL | `/api/engine` calls Qwen for open domains, and `/api/explain` labels open-domain model output unverified; no live open-domain browser test in this audit. | 4, 6 |
| Living visual output | BROKEN against contract | `/living-engine` renders the generated result as a single `<img>` or noninteractive SVG fallback. Its scene graph does not drive stage camera, cutaway, hotspots or motion on this route. | 4, 5, 8 |
| Follow-up in same world | EXPERIMENTAL | Previous title, summary, anchors, relations and image are passed to separate engine/image calls; tests check reconciliation and prompt contracts, not observed visual identity retention over a live sequence. | 7 |
| History and recovery | EXPERIMENTAL | IndexedDB saves worlds and turns, supports restore and JSON export. Browser reload/recovery was not exercised; no cross-device sync/import. | 9 |
| Input modes | MISSING from living route | The route exposes one text question field; the richer input composer exists elsewhere in the app, disconnected from this journey. | 4, 11 |
| Understanding check/adaptation | EXPERIMENTAL | Helper logic has unit tests and controls on the older root route; it is not part of the living generated-image route. | 4, 6 |
| Real semantic 3D controls | EXPERIMENTAL | `ThreeConceptScene` implements camera and actions for graph nodes on root, while living output is a flat image. | 5, 8 |
| Provider truth gate | EXPERIMENTAL | Generation calls Qwen text, image and vision review; review is model judgement. External grounding and cross-domain scientific validation are missing. | 6, 12 |
| Cost control | BROKEN against ceiling | One image per request and in-memory rate guard exist; no persistent per-request spend ledger or $10 hard cutoff. The route may call several paid models on one submit. | 10 |
| Pilot security and operations | EXPERIMENTAL | In-memory rate guard resets across instances; current CI has no browser E2E or live-provider budget check. | 10, 13 |
| Mobile/Arabic | EXPERIMENTAL | Arabic/RTL text and flexible layouts exist; no device matrix or actual mobile browser acceptance yet. | 11 |
| Closed pilot and launch | MISSING | No named cohort, consent, measured pilot results, exit criteria, rollback or production acceptance in repository. | 13–15 |

## Point 3 Definition of Done

- [x] Fresh repository branch, SHA, CI and matching deployment recorded.
- [x] Source code and test boundaries inspected; status for each required product subsystem documented with observable evidence or explicit test limit.
- [x] Production build, automated tests, HTTP smoke and initial browser interaction checked.
- [x] Gaps assigned to subsequent plan points without presenting an untested feature as working.

## Point 4 entry condition

Make one coherent, testable path from question to understanding, interactive visual explanation and follow-up. Add an end-to-end browser test for visible scene changes before closing Point 4. A provider call must respect the existing $10 ceiling; a curated fixture can validate interaction without spending money.
