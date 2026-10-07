# ZZ4 350 science lock

Reference date: 2026-10-07. Implements [Issue #22](https://github.com/coantoai/NAHLATY_MY_BEE/issues/22).

## Scope and evidence boundary

The reference is **Chevrolet Performance ZZ4 Engine (24502609 Base) Long Block**, specifications PN **19172321**, **REV 09JA15**. The main source is Chevrolet's [official long-block guide](https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/performance/resources/installation-guides/crate-engines/01-images/zz4-engine-long-block-installation-guide-24502609.pdf). The [2026 Chevrolet Performance Catalog](https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/performance/powertrain/order-catalog/02-pdf/2026_Chevrolet_Performance_CATALOG.pdf) supplies a compatible replacement-rod inference. Complete citations, page references, source hashes, and parameter statuses are in [ZZ4_EVIDENCE_LEDGER.md](ZZ4_EVIDENCE_LEDGER.md).

This is a **single-cylinder explanatory section**, not a full V8 CAD reconstruction, combustion simulation, performance prediction, or manufacturing drawing. The user confirmed that the earlier ZZ4 cutaway was uncommitted and authorized adapting the existing repository runtime. The implementation brings forward the repository's historical procedural Three.js piston scene into `/engine-benchmark` within the existing Next.js/React/Three.js stack. It preserves its metallic materials, dark atmospheric lighting, camera composition, local RAF animation, and focus/isolate interactions. Existing application routes and runtime remain in place.

## Parameter lock

| Parameter | Selected value | Status | Basis / limitation |
| --- | --- | --- | --- |
| Bore | 101.6 mm | VERIFIED | 4.00 in, long-block sheet 6; exact conversion using 25.4 mm/in. |
| Stroke | 88.392 mm | VERIFIED | 3.48 in, sheet 6. The earlier 88.39 mm is a rounded value and is not used as the exact model input. |
| Modeled rod center distance | 144.78 mm | INFERRED | Catalog PDF p63 / printed p122 gives compatible 19435115 rods as 5.700 in. The same page permits 10108688 **or** 19435115 for the post-November-1998 ZZ4 crank. The model assumes that compatible replacement. |
| Original 10108688 rod center distance | Not established | UNKNOWN | Listed in long-block sheet 9; no direct original-part length specification was retrieved. |
| Crank radius | 44.196 mm | INFERRED | Stroke / 2 for the declared inline slider-crank model. Not a journal/counterweight dimension. |
| Nominal displacement | 350 in³ | VERIFIED | Published designation, sheet 6; not exact calculated volume. |
| Calculated eight-cylinder swept volume | 5732.977599 cm³ | INFERRED | `8 × π/4 × bore² × stroke / 1000`; calculated from the published rounded dimensions. |
| Nominal compression | 10:1 | VERIFIED | Sheet 6; insufficient to determine crown, deck, gasket, or chamber contours. |
| Maximum valve lift | Intake 12.0396 / exhaust 12.954 mm | VERIFIED | .474 / .510 in, sheet 6. |
| Cam duration | Intake 208° / exhaust 221° | VERIFIED | **At .050 in tappet lift**, sheet 6; not seat-to-seat duration or valve-open windows. |
| Cam centerlines | Intake 108° ATDC / exhaust 116° BTDC | VERIFIED | Sheet 6; checking context must be preserved. |
| Valve angle / diameters | 23°; intake 49.276 / exhaust 38.1 mm | VERIFIED | Sheet 6; does not provide seat positions or cutaway azimuth. |
| Firing order | 1-8-4-3-6-5-7-2 | VERIFIED | Sheet 4 diagram and sheet 6; full eight-cylinder phasing is not drawn. |
| Initial / total ignition settings | 10° BTDC at 650 rpm / 32° BTDC at 4000 rpm | VERIFIED | Sheets 4–6; vacuum advance disconnected and plugged, and remains disconnected; internal centrifugal advance only. Warm-up condition applies to the total-setting startup instruction. |
| Exact seat valve events, overlap, lift curve, spark map | Not established | UNKNOWN | Neither durations nor two distributor settings supply these data. |

VERIFIED means documented for the stated reference and context, not measured on a particular physical engine or guaranteed across all applications. INFERRED means a declared analytical or visualization assumption. UNKNOWN values have no factory value assigned in the reference module.

## Shared motion state

`app/lib/engine/zz4Reference.js` contains the tagged reference. `zz4Model.js` owns the 720° phase and kinematics. `cutawayRig.js` applies that single sample to the existing scene's piston, rod, crankpin, valve markers, spark, and combustion cues. Meshes do not invent independent piston or ignition clocks.

The angle convention is **0° = intake/gas-exchange TDC**, **180° = intake BDC**, **360° = compression TDC**, **540° = power BDC**, and **720° = gas-exchange TDC**. Crank angle is periodic over 360°; four-stroke identity is periodic over 720°. This is a mathematical reference convention, not a verified factory cutaway camera orientation.

For radius `r = stroke/2`, rod center distance `L`, and crank angle `θ`, the declared inline, zero-offset rigid-link model uses:

```text
crankpin = (y: r cos θ, z: r sin θ)
wristpin = (y: r cos θ + sqrt(L² − r² sin² θ), z: 0)
travel from TDC = L + r − wristpin.y
rod angle = atan2(−crankpin.z, wristpin.y − crankpin.y)
```

The relation follows from the right triangle between the two pins and the cylinder axis. It preserves crank radius, rod center distance, exact selected stroke, and aligned TDC/BDC. Wrist offset, lateral pin offsets, bearing clearance, flex, and thermal effects are not established for the factory engine; the model assumes a rigid inline mechanism. No result is a tolerance study.

Pause, focus, and isolate preserve the current angle. Resume continues it; replay alone explicitly returns to 0°. A slow 120 crank-degrees/second presentation speed is INFERRED and is not an operating RPM claim.

## Valve and ignition truth

Maximum valve lift and the 23° valve angle can inform a schematic actuator. Exact stem/seat locations, tilt azimuth, ports, springs, cam lobes, lifter/pushrod/rocker geometry, and the loaded lift curve remain outside the dimensional lock.

The default animation keeps an explicitly **INFERRED educational schedule**: intake 0–180°, exhaust 540–720°, a sine lift envelope, and an ignition marker at compression TDC with a six-degree visual visibility window. The six-degree window is not spark duration. The combustion glow is not pressure, heat release, flame propagation, or measured burn duration. The published .050-in cam duration is displayed as evidence; it is not misused as a seat-open interval.

Intake and exhaust lift are sampled **independently**. Overlap is supported by the model and tested using explicit synthetic overlapping windows; no mutual exclusion rule forces one valve closed. The selected ZZ4's actual overlap is UNKNOWN, so synthetic test angles are not used as factory defaults. Even centerline plus duration would require an explicitly justified profile symmetry/checking convention to infer event endpoints, and would still not determine seat events or a complete lift curve.

The guide's ignition recommendations remain separate from the educational spark marker. The model accepts an explicitly selected advance for QA; the production educational default is 0°, tagged INFERRED. It does not interpolate a factory spark map from 10°/650 rpm and 32°/4000 rpm, nor imply that 32° applies universally. The cylinder fires once per 720° rather than once per crank revolution.

## Audit disposition and QA

The historical scene's independent sine piston, dynamically stretched rod, 360° ignition, pose resets, and conditional hook order were identified before adaptation. The new implementation derives all rotating-assembly transforms from the rigid-link state, keeps rod scale fixed, uses a 720° event phase, preserves paused poses, and uses a stable component hook sequence.

`scripts/qa-legacy-engine.mjs` verifies and executes the historical source fixture, reports the original mechanical failures, and exits **1** deliberately. Its diagnostic tests passing means the defects are reproducibly detected; it does not mean that legacy mechanics pass. The current mathematical and real Three.js mesh suites run separately through `npm test`.

The deterministic coverage includes full-cycle rod/radius/endpoint invariants, stroke and dead centers, finite-rod motion, negative/fractional/wrapped angles, four-stroke phase boundaries, valve windows and overlap capability, compression-TDC spark advance, repeatable mesh states, and pause/resume/replay. The visual gap report distinguishes source/transform verification from pixel inspection. Actual commands and final results are recorded in [ZZ4_VALIDATION.md](ZZ4_VALIDATION.md).

## Remaining uncertainties

- Original 10108688 rod length; the modeled compatible replacement remains an inference.
- Original piston/wrist-pin offset, compression height, crown/reliefs, ring grooves, and manufacturing clearances.
- Full crankshaft journal/counterweight dimensions, axial rod arrangement, bank angle/selected section, and all eight cylinders' assembly geometry.
- Head/chamber contours, exact deck and gasket dimensions, port routing, plug position/angle/reach, and valve-seat coordinates.
- Seat-level valve events, checking-height-dependent overlap, lobe/ramp shape, actual installed timing and hydraulic/loaded valvetrain behavior.
- Full centrifugal advance curve and operating-condition ignition map, rather than the documented setup recommendations.
- Pressure, gas velocity/reversal, mixture, temperature, heat release, exhaust boundary conditions, and combustion dynamics.
- Output ratings and the exact intake/exhaust/dyno conditions for this reference; these are not asserted.
- Final cinematic asset fidelity: the existing procedural assembly is retained and labeled schematic. A measured sectional reference is needed before producing a factory-faithful final asset.

Model QA can pass under its stated inputs while these facts remain UNKNOWN. This science lock does not claim complete or “100% accurate” ZZ4 reproduction.
