# Heart QA report

Recorded 2026-10-07 for Issue #23. The final acceptance verdict for the requested educational heart integration is **PASS**. This is a runtime, vector-integrity and source-bounded educational result; it is not clinical validation.

## Scope and verdict

| Area | Result | Evidence |
| --- | --- | --- |
| Required anatomy and semantic IDs | PASS | 13 required concepts are bound to unique editable SVG groups; four chambers, four valves, venae cavae, pulmonary artery, pulmonary veins, aorta and myocardium are covered |
| Closed circulation and oxygenation | PASS | 15-node closed route and 14 directed edges; pulmonary-vein edges are oxygenated and pulmonary-artery edges are deoxygenated |
| SVG integrity and layer order | PASS | 167 native paths, 51 groups, no `image` elements, no raster payload, local references resolve, `back-heart → blood-interior → front-occlusion` is validated, and every flow is clipped to `heart-lumen` |
| Runtime compatibility | PASS | Existing `Home` / Interactive Vector Runtime remains the host; click, focus, graph drag, pan, zoom, labels, vessels, flow, reset, Play/Pause and saved-session behavior are covered |
| BPM and animation timing | PASS | Browser checks verify 40 BPM = 1.5 s and 180 BPM = 1/3 s, shared phase after visibility changes, pause/resume and reduced-motion behavior |
| Responsive presentation | PASS | Desktop 1440px, tablet 768px and mobile 390px checks keep the SVG, every visible label and each rendered label text line inside the scene frame |
| Premium visual target | PASS for the educational cutaway | Refined native gradients, myocardial depth, septum, valve leaflets, vessel occlusion and front tissue hierarchy are present in the production screenshots |
| Clinical certification | UNKNOWN / not claimed | Geometry, timing and display values are authored educational conventions; no patient, pathology, pressure, coronary or clinical measurement model is present |

The preserved NIH/NIAID exterior remains available as a separate selectable view. Its 639 native paths and public-domain attribution are retained; it is not used as proof of hidden chambers or valve geometry.

## Reproduction

From the repository root and the Issue #23 branch:

```bash
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
NEXT_TELEMETRY_DISABLED=1 npm run start -- --hostname 127.0.0.1 --port 3019
NAHLATY_SMOKE_BASE=http://127.0.0.1:3019 node scripts/smoke-prod.mjs
python3 scripts/qa-heart-science.py --url http://127.0.0.1:3019 --output /workspace/heart-issue23-evidence/science-production
```

The final run used Node.js 24.19.0, npm 11.9.0, Python Playwright and `/usr/bin/chromium`.

Observed results:

- `npm test`: **117 passed, 0 failed**.
- `npm run build`: **exit 0**; the build includes the same 117-test suite.
- Production smoke: **exit 0**. Root/living pages returned 200; engine health was `engine-v2`; the cutaway returned 13 bound concepts and 14 flow edges; the preserved exterior returned 639 paths; existing engine route checks returned 10 heart steps, 20 assets, valve step 3 and follow-up step 3.
- Browser QA: **28 passed, 0 failed**, with no browser page errors. This includes all 13 anatomy bindings, actual chamber-lumen clicks, all four rendered valve leaflets, canonical flow/layer checks, pan cancellation, graph drag/reset, labels/vessels/flow toggles, Play/Pause, 40/180 BPM, reduced motion, saved home state, exterior switching and unsafe-SVG rejection.
- `git diff --check`: clean.

The committed copies of the final artifacts are in [evidence](evidence/): [science-results.json](evidence/science-results.json), [production-smoke.json](evidence/production-smoke.json), and the desktop, mobile, tablet and reduced-motion screenshots.

## Anatomy and topology mapping

The authored SVG maps the runtime concepts as follows:

| Runtime concept | SVG ID | Role |
| --- | --- | --- |
| `heart.venaCava` | `vena-cava` | Superior and inferior systemic venous return |
| `heart.rightAtrium` | `right-atrium` | Receives systemic venous return |
| `heart.tricuspidValve` | `tricuspid-valve` | Right atrium to right ventricle |
| `heart.rightVentricle` | `right-ventricle` | Ejects toward pulmonary valve |
| `heart.pulmonaryValve` | `pulmonary-valve` | Right ventricle to pulmonary artery |
| `heart.pulmonaryArtery` | `pulmonary-artery` | Deoxygenated flow toward lungs |
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

The SVG has explicit `data-from`, `data-to`, `data-oxygenation`, `data-start` and `data-end` attributes on each canonical flow path. The validator checks that path geometry begins and ends at those declared anchors, that flow groups sit inside the blood layer and the `heart-lumen` clip, and that the oxygenation agrees with the semantic contract.

## Knowledge boundaries

Verified facts are the normal four-chamber/four-valve anatomy, septal separation, valve locations, vena-cava return, pulmonary artery oxygen-poor direction, pulmonary-vein oxygen-rich return and the closed normal postnatal route. Red/blue coloring, authored paths, normalized animation phases, the 40–180 BPM control range and the fixed 70 mL stroke-volume display are labeled inferences or educational conventions. Individual stroke volume, ejection fraction, pathology, pressure, transit time, coronary perfusion and clinical response remain unknown.

The cutaway is original repository geometry. NIH/NIAID credit applies to the preserved exterior reference and does not imply NIH creation, review or endorsement of the cutaway. See [HEART_SCIENCE_LOCK.md](HEART_SCIENCE_LOCK.md) and [HEART_EVIDENCE_LEDGER.md](HEART_EVIDENCE_LEDGER.md) for the source quotations, provenance and claim register.

## Remaining limits

The scene intentionally models normal educational circulation rather than fetal circulation, congenital variants, disease, coronary circulation, pressure or patient-specific measurements. “Oxygenated” and “deoxygenated” describe relative oxygen content; blue remains a diagram convention. The cardiac-output number is deterministic arithmetic using the fixed educational assumption of 70 mL/beat and must not be read as a user measurement.
