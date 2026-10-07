# Issue #22 validation record

Validated on 2026-10-07 UTC, branch `codex/issue-22-zz4-science-lock`, against the existing `main` application at base `6b0f1625ec312bfc4c9781c9e2f252d24468a80d`. The single-cylinder benchmark adapts the archived cinematic Three.js scene; it does not replace the application's runtime.

## Results and limits

| Check | Result | Evidence / scope |
| --- | --- | --- |
| Complete `npm test` suite | **PASS: 67/67**, 0 failed, 0 skipped, 0 todo | 34 existing adaptation tests; 4 reference tests; 9 model tests; 14 actual-mesh tests; 6 historical diagnostic tests. |
| Production `npm run build` | **PASS**, exit 0 | Next.js 14.2.35 compiles and generates 15 static pages; `/engine-benchmark` is included. |
| Current model scientific acceptance | **PASS**, conditional | Declared rigid inline model with documented bore/stroke and an explicitly INFERRED compatible-rod length; not a measurement of an assembled ZZ4. |
| Complete factory reconstruction | **UNKNOWN / not accepted** | Missing original-part dimensions, full cam/ignition data, manufacturing geometry, and physical gas model. No complete-accuracy claim. |
| Declared schematic visual acceptance | **PASS**, limited | Actual production browser checks and screenshot inspection on desktop/mobile, plus deterministic mesh and enclosure checks. |
| Factory-faithful final cinematic asset | **FAIL / UNKNOWN** | Current procedural head/crown/ports/plug/valvetrain do not have measured sectional references. See component classifications in the visual gap report. |
| Historical standalone diagnostic | **EXPECTED FAIL**, exit 1 | Reproduces variable rod length, endpoint mismatch, incorrect dead centers, and two ignition windows per 720°. Current tests passing do not relabel this source as correct. |
| Browser controls / fallback | **PASS**, all three configurations | Desktop 1440×1100, mobile 390×844, and WebGL disabled; no uncaught browser exceptions or horizontal overflow. Software Chromium rendering, not a hardware GPU certification. |
| Existing routes and benchmark readiness | **PASS** | `/`, `/heart-cinematic`, `/visual-benchmark`, `/engine-benchmark` return HTTP 200 with HTML; benchmark contains ZZ4 reference and UNKNOWN disclosures. |
| Optional live Gemini generation | **UNVERIFIED** | No live API key was required for the benchmark. Existing `/api/explain` fallback was exercised successfully during environment setup; live model generation was not tested. |

The new engineering CI runs full tests and the production build on Node 22.20.0. Remote CI execution is separate from these locally observed results; check the PR's checks for its outcome. Browser automation is an optional separate tool, not an application dependency.

## Reproduce deterministic checks

In this cloud environment:

```bash
export PATH="/workspace/shared/node22/node_modules/node/bin:$PATH"
cd /workspace/NAHLATY_MY_BEE
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
node --experimental-default-type=module scripts/qa-legacy-engine.mjs
```

The final command deliberately returns 1 for the archived defects. It validates the pinned fixture's Git blob hash and executes the original animation in a CPU Three.js fixture; it does not require historical Git objects, WebGL, or a full clone. Do not use its expected failure as a current-model acceptance gate or suppress unrelated errors.

The repository has no lockfile. The tested installation keeps dependency declarations unchanged and uses `npm install --package-lock=false --no-audit --no-fund`. Node 24 removed the existing test command's `--experimental-default-type` flag; setup installs Node 22.20.0 outside the checkout instead of rewriting the runtime/test script. Versions used here: Next 14.2.35, React/React DOM 18.3.1, Three.js 0.186.1. Future unconstrained dependency resolution is not guaranteed to select identical patch versions.

## Coverage that demonstrates the engineering correction

- Pure model: crank radius and rod center-distance invariance over 0–720° in 0.5° increments (1441 samples, 1e-9 mm tolerance); exact TDC/BDC and stroke; finite-rod midpoint; rejected invalid geometry; negative/fractional/multiple-cycle angles.
- Shared four-stroke state: all phase boundaries and 720° wrap; equal crank geometry on different strokes; independent wrapped valve windows and a synthetic overlapping-window fixture. Synthetic overlap is a capability test, not ZZ4 event evidence.
- Ignition: selected advance relative to compression TDC, one event per 720°, no second-revolution duplicate; factory RPM/vacuum setup conditions remain separate from the educational default.
- Real meshes: full-cycle crankpin/rod/wrist endpoints and fixed rod scale over 721 integer-degree samples (1e-8 scene-unit tolerance); documented travel and bore mapping; valve tilt magnitude, disk diameters, maximum lifts, and lift direction; repeatable frozen-state transforms and independently gated gas cues.
- Review regressions: floor below rotating assembly at sampled cardinal angles, transparent head for flow visibility, liner-to-head closure, combustion cue inside the schematic power-stroke envelope, and spark cue inside the schematic compression-TDC gas space. These visual layout checks are not manufacturing tolerance checks.
- Provenance: exact unit conversions and factory values; compatible-part rod remains INFERRED; unknown factory parameters remain null; timing assumptions remain distinct; archived source hash refuses a substituted fixture.

Tests failed before the new model/adapter/diagnostic existed. Added dimension/layout regressions also failed against the earlier implementation, including the spark-envelope assertion at 360°, then passed after correction. These tests inspect actual transforms and event behavior rather than accepting an attractive render as scientific evidence.

## Reproduce browser QA

Start the built application in one terminal:

```bash
NEXT_TELEMETRY_DISABLED=1 npm run start -- --hostname 127.0.0.1 --port 3000
```

Run the committed harness with this environment's existing tools:

```bash
PLAYWRIGHT_MODULE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
ZZ4_BROWSER_PATH=/usr/bin/chromium \
node scripts/qa-engine-browser.cjs
```

Outside this cloud instance, install Playwright 1.62.1 as separate QA tooling and provide its module path and Chromium executable, or let Playwright use its installed browser. For example, install the tool into `/tmp/nahlaty-playwright` with `npm install --prefix /tmp/nahlaty-playwright --package-lock=false --no-audit --no-fund playwright@1.62.1`, then use `PLAYWRIGHT_MODULE_PATH=/tmp/nahlaty-playwright/node_modules/playwright`. Browser installation and OS prerequisites depend on the host. The application package manifest is unchanged.

`ZZ4_BASE_URL` selects the tested server; `ZZ4_QA_OUTPUT_DIR` selects the output directory (default `/tmp/zz4-browser-qa`). A successful run exits 0 and writes `results.json` plus three screenshots. Assertions check page HTTP status, actual canvas creation, frozen angles after stop/focus/isolate, replay near zero, resumed advance, keyboard activation, responsive width, and disabled controls plus a readable fallback when WebGL is unavailable. Screenshots are presentation records, not pixel-diff or factory-CAD oracles.

Reviewed production captures: [desktop](images/zz4-desktop.png), [mobile](images/zz4-mobile.png), [WebGL disabled](images/zz4-webgl-disabled.png). The metallic/brass palette, dark atmospheric stage, perspective camera, and cutaway emphasis are preserved. Angle readout publishes at up to 100 ms intervals from the render sample; it may visibly lag the current mesh by that interval.

## Remaining uncertainties and acceptance blockers

1. Original rod 10108688 center distance. The 144.78 mm model default is inferred from catalog-compatible 19435115; it is not direct verification of the original part.
2. Full rotating assembly: journal/pin/bearing diameters, counterweights and axial spacing, rod beam/end shapes, complete V8 throw/phasing arrangement, crank-to-cylinder offset, actual bank section, and all eight cylinders' geometry. The family-based 90° bank-angle interpretation is inferred; the cutaway does not render the complete engine.
3. Piston/wrist geometry: pin offset and diameter, compression height, crown/reliefs, skirt/ring grooves, bore length/wall thickness, manufacturing clearance, block deck height, assembled deck clearance, gasket bore/thickness, and exact head/chamber contours. Nominal 10:1 and 58 cm³ do not uniquely reconstruct these.
4. Complete valvetrain: actual counts/seat coordinates, spring/stem/lifter/pushrod/rocker geometry, tilt azimuth, installed timing, seat/advertised opening and closing events, overlap at a stated checking lift, lobe/ramp and valve-lift curves, lash/preload response, and loaded hydraulic behavior. The documented 208°/221° durations are at .050 in **tappet** lift.
5. Ignition: full centrifugal advance curve and RPM/load/temperature operating map, plus plug angle/reach/coordinates/electrode location. Initial 10° at 650 rpm and total 32° at 4000 rpm are conditioned setup recommendations with vacuum advance disconnected and plugged, remaining disconnected; startup total setting follows warm-up. The default 0° educational marker and six-degree visibility window are inferred.
6. Gas paths and dynamics: actual port directions/coordinates/sections, boundary pressures/temperatures, mixture, mass flow/velocity/reversal, leakage, heat release, and combustion progression. Colored cues are neither CFD nor pressure/flame measurements.
7. ZZ4 power/torque ratings and their matched intake/exhaust/dyno configuration. Other crate-engine catalog ratings are not substituted.
8. Final asset and platform fidelity: measured sectional/CAD reference is absent; software-rendered desktop/mobile checks do not establish all camera views, hardware GPUs, or a complete factory-faithful cinematic asset. Missing factory geometry remains a blocker to that stronger visual acceptance.

Next step: obtain matched original-part dimensions and a factory section/CAD, cam card/lift data, and distributor advance curve. Refine the existing scene's unknown geometry and timing only where this evidence supports it. Keep the current stack, shared-state model, and cinematic materials/camera; rerun the same QA after each justified refinement.
