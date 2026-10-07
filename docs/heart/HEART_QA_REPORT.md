# Heart QA report

Recorded 2026-10-07 for Issue #23, including the follow-up scientific audit. The final acceptance verdict for the requested educational heart integration is **PASS**. This is a runtime, vector-integrity and source-bounded educational result; it is not clinical validation.

## Scope and verdict

| Area | Result | Evidence |
| --- | --- | --- |
| Required anatomy and semantic IDs | PASS | 13 required concepts are bound to unique editable SVG groups; four chambers, four valves, superior/inferior vena cava, pulmonary trunk/arteries, oxygenated pulmonary veins, aorta and myocardium are covered |
| Closed circulation and oxygenation | PASS | 15-node closed route and 14 directed edges; pulmonary-vein edges are oxygenated and pulmonary-artery edges are deoxygenated |
| SVG integrity and layer order | PASS | 167 native paths, 51 groups, no `image` elements or raster payload, local references resolve, and `back-heart → blood-interior → front-occlusion` is validated; full flow strokes fit the lumen and crossing masks actually occlude rear blood |
| Valve ports and cycle states | PASS | Actual leaflet hinges stay fixed; open ports clear the full flow stroke, closed leaflets obstruct it, filling/ejection streams never overlap, and no through-valve flow appears in illustrative isovolumic intervals |
| Runtime compatibility | PASS | Existing `Home` / Interactive Vector Runtime remains the host; click, focus, graph drag, pan, zoom, labels, vessels, flow, reset, Play/Pause and saved-session behavior are covered |
| BPM and animation timing | PASS | Browser checks verify 40 BPM = 1.5 s and 180 BPM = 1/3 s, shared phase after visibility changes, pause/resume and reduced-motion behavior |
| Responsive presentation | PASS | Desktop 1440px, tablet 768px and mobile 390px checks keep the SVG, every visible label and each rendered label text line inside the scene frame |
| Application entrypoints | PASS | Main heart questions, `/heart-cinematic`, `/engine-proof` and `/living-engine` use the native cutaway; main/proof follow-ups, seeded audience changes and mobile controls are exercised through actual UI actions |
| Premium visual target | PASS for the educational cutaway | Refined native gradients, myocardial depth, septum, valve leaflets, vessel occlusion and front tissue hierarchy are present in the production screenshots |
| Clinical certification | UNKNOWN / not claimed | Geometry, timing and display values are authored educational conventions; no patient, pathology, pressure, coronary or clinical measurement model is present |

The preserved NIH/NIAID exterior remains available as a separate selectable view. Its 639 native paths and public-domain attribution are retained; it is not used as proof of hidden chambers or valve geometry.

## Corrections covered by this audit

- Routed normal heart lessons through the existing native SVG runtime instead of generated cinematic images or legacy chamber schematics. The ten established lesson indices and the valve follow-up index remain intact.
- Repaired the RV outlet path and two pulmonary-vein inlet edges. Full-stroke samples now remain within their chamber/vessel lumens; the RV outlet avoids the front septum.
- Replaced leaflet scaling with rotation about actual authored hinges and removed transverse valve-rim bars that sealed open ports. Filling and ejection use separate windows, with no flow during leaflet transitions.
- Made reduced-motion rendering static with phase-specific flow hidden, avoiding simultaneous flow through closed valves.
- Corrected per-concept citations and added sourced pressure-driven valve behavior, passive filling, pulmonary trunk branching, and explicit omission of chordae tendineae/papillary muscles.
- Preserved all 15 scene concepts and 14 relations in downstream scene tools. Specific valve/vessel questions select the relevant explanation; source articles and clinical questions retain the general content contract. Coronary and conduction lessons explicitly disclose text-only coverage.
- Corrected inherited label sizing on scientific main-page scenes. Actual desktop/mobile label rectangles are checked for overlap, so pulmonary-vein and lung labels remain independently readable and actionable.

## Reproduction

From the repository root and the Issue #23 branch:

```bash
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
NEXT_TELEMETRY_DISABLED=1 npm run start -- --hostname 127.0.0.1 --port 3019
NAHLATY_SMOKE_BASE=http://127.0.0.1:3019 node scripts/smoke-prod.mjs
python3 scripts/qa-heart-science.py --url http://127.0.0.1:3019 --output /workspace/heart-issue23-evidence/science-followup-production
python3 scripts/qa-heart-entrypoints.py --url http://127.0.0.1:3019 --output /workspace/heart-issue23-evidence/entrypoints-followup-production
```

The final run used Node.js 24.19.0, npm 11.9.0, Python Playwright 1.62.0 and `/usr/bin/chromium`. Both browser scripts accept `--chromium` for a different installed browser. CI installs Playwright/Chromium and runs both suites against its production server, retaining the evidence artifact.

Observed results:

- `npm test`: **127 passed, 0 failed**.
- `npm run build`: **exit 0**; the build includes the same 127-test suite.
- Production smoke: **exit 0**. Root/living pages returned 200; engine health was `engine-v2`; the cutaway returned 13 bound concepts and 14 flow edges; the preserved exterior returned 639 paths; engine and explain responses used `heart-semantic-svg`, ten heart steps, valve initial step 3 and follow-up step 3. The 20 legacy WebP files remain available, but scientific lesson steps contain no image/media precedence.
- Physical/runtime browser QA: **33 passed, 0 failed**, with no browser page errors. This includes full-stroke lumen containment, actual SVG fill/stroke valve patency, hinge invariance, dense phase checks, rasterized crossing-mask occlusion, all 13 anatomy bindings, real chamber/leaflet clicks, pan/zoom, graph drag/reset, labels/vessels/flow, Play/Pause, 40/180 BPM, reduced motion, saved state, exterior switching and unsafe-SVG rejection.
- Entrypoint browser QA: **10 passed, 0 failed**, with no page errors or paid-generation requests. Actual main-page question/follow-up actions, BPM and output, toggles, reset to lesson 0, playback, legacy/proof/living routes, proof follow-up/audience switching and unforced mobile interaction passed against the final production build.
- Independent review: no remaining Critical or Important findings; routing, named-structure answers, source-content preservation, seeded context, omitted-geometry outcomes and downstream support details were corrected before final verification.
- `git diff --check`: clean.

The saved final artifacts are in [evidence](evidence/): [science-results.json](evidence/science-results.json), [production-smoke.json](evidence/production-smoke.json), desktop/mobile/tablet/reduced-motion screenshots, and [entrypoint evidence](evidence/entrypoints/entrypoint-results.json) with screenshots of the application routes.

The final cutaway is 41,596 bytes; its SHA-256 is `6f877b6aaf49ceef9b2cd79d0f7c6d7c684216fb4522407354c9349d27cfe0c2`. SVG and generator hashes match the regenerated provenance. The unchanged NIH exterior hash remains `a8d968b2239391333156180456a4b022920b0cd8971756f7d1c4d8cc132b5f1c`.

## Anatomy and topology mapping

The authored SVG maps the runtime concepts as follows:

| Runtime concept | SVG ID | Role |
| --- | --- | --- |
| `heart.venaCava` | `vena-cava` | Superior and inferior systemic venous return |
| `heart.rightAtrium` | `right-atrium` | Receives systemic venous return |
| `heart.tricuspidValve` | `tricuspid-valve` | Right atrium to right ventricle |
| `heart.rightVentricle` | `right-ventricle` | Ejects toward pulmonary valve |
| `heart.pulmonaryValve` | `pulmonary-valve` | Right ventricle to pulmonary artery |
| `heart.pulmonaryArtery` | `pulmonary-artery` | Pulmonary trunk and branches; deoxygenated flow toward lungs |
| `heart.pulmonaryVeins` | `pulmonary-veins` | Oxygenated return from lungs |
| `heart.leftAtrium` | `left-atrium` | Receives pulmonary venous return |
| `heart.mitralValve` | `mitral-valve` | Left atrium to left ventricle |
| `heart.leftVentricle` | `left-ventricle` | Ejects through aortic valve |
| `heart.aorticValve` | `aortic-valve` | Left ventricle to aorta |
| `heart.aorta` | `aorta` | Oxygenated systemic delivery |
| `heart.myocardium` | `myocardium` | Muscular wall and front occlusion |

The locked directed route is:

```text
body → vena cava → right atrium → tricuspid → right ventricle
→ pulmonary valve → pulmonary artery → lungs
→ oxygenated pulmonary veins → left atrium → mitral → left ventricle
→ aortic valve → aorta → body
```

The SVG has explicit `data-from`, `data-to`, `data-oxygenation`, `data-start` and `data-end` attributes on each canonical flow path. The validator checks anchors, topology, clipping and oxygenation. Browser QA additionally samples the full flow stroke every 0.5 SVG unit at center and ±1.75-unit offsets, checks actual open-port tissue/leaflet fill and stroke, and samples 200 normalized cycle positions. Zero containment violations or simultaneous filling/ejection samples were observed. Crossing-mask checks rasterize the actual SVG solely for pixel-level QA; the shipped SVG contains no raster fallback.

## Knowledge boundaries

**VERIFIED** means inspected reliable source text supports the normal anatomy/physiology: four chambers/four valves, septal separation, valve locations, vena-cava return, pulmonary arterial/venous direction and oxygenation, the closed normal postnatal route, and pressure-related passive valve motion. **INFERRED** covers red/blue encoding, authored geometry, omitted fine anatomy, normalized animation phases, the 40–180 BPM control range and the fixed 70 mL stroke-volume display. **UNKNOWN** includes individual stroke volume, ejection fraction, pathology, pressure, transit time, coronary perfusion and clinical response. These labels correspond to runtime `fact`, `inference` and `unknown` respectively; VERIFIED does not certify geometry or clinical behavior.

The cutaway is original repository geometry. NIH/NIAID credit applies to the preserved exterior reference and does not imply NIH creation, review or endorsement of the cutaway. See [HEART_SCIENCE_LOCK.md](HEART_SCIENCE_LOCK.md) and [HEART_EVIDENCE_LEDGER.md](HEART_EVIDENCE_LEDGER.md) for the source quotations, provenance and claim register.

## Remaining limits

The scene intentionally models normal educational circulation rather than fetal circulation, congenital variants, disease, coronary circulation, pressure or patient-specific measurements. “Oxygenated” and “deoxygenated” describe relative oxygen content; blue remains a diagram convention. The cardiac-output number is deterministic arithmetic using the fixed educational assumption of 70 mL/beat and must not be read as a user measurement.

The user's uploaded MP4 could not be transferred because it exceeds the executor's 32 MiB upload-download limit. No recording inspection is claimed; this audit used repository/source inspection and the live app. A compressed or trimmed recording below that limit is required for video-specific findings.

Vercel deployment state is reported separately in the Draft PR. Direct preview access from this environment is blocked at proxy CONNECT with HTTP 403 (`server: envoy`), before reaching Vercel; this is not evidence of Vercel deployment protection or a failed deployment. The production build was exercised locally using the commands above.
