# ZZ4 visual gap report

Audit date: 2026-10-07. Related request: [issue #22](https://github.com/coantoai/NAHLATY_MY_BEE/issues/22).

## Scope and disposition

**Final integrated audit:** `/engine-benchmark` adapts the historical `SmartAssetDemo` documented below within the existing Next.js/React/Three.js application. The user confirmed that the earlier ZZ4 cutaway was uncommitted and authorized this starting point. Existing application routes, runtime, and dependencies remain intact.

The final scene was inspected through deterministic tests of actual Three.js transforms, independent code review, and Chromium desktop/mobile renders. Factory comparisons use the selected long-block specifications (F1) and compatible-parts catalog (F4), registered in [the evidence ledger](ZZ4_EVIDENCE_LEDGER.md). Screenshot inspection establishes presentation and readability in those views; it cannot establish factory CAD fidelity or real gas behavior. The historical audit below remains available as evidence of the defects corrected.

| Gate | Result | Evidence and limit |
| --- | --- | --- |
| Starting runtime identification | **PASS**, limited | The user authorized adapting the exact historical Three.js runtime documented below. This identifies the starting point and does not validate the resulting ZZ4 visualization. |
| Current rigid-link geometry and shared cycle | **PASS**, under declared inputs | Fixed radius/rod length, documented stroke, dead centers, valve/spark/flow synchronization, and repeated states are tested on model and meshes. Rod length remains a compatible-part inference. |
| Current schematic presentation and controls | **PASS**, limited | Desktop 1440×1100 and mobile 390×844: rendered canvas, preserved paused angle, replay/resume, keyboard control, no uncaught exceptions or horizontal overflow. WebGL-disabled fallback passes. |
| Historical mechanics | **FAIL**, reproduced | The archived source still fails rigid-rod closure, dead-center alignment, and one-spark-per-720° checks. This diagnostic is separate from current acceptance. |
| Full factory-faithful visual acceptance | **FAIL / UNKNOWN** | No measured section/CAD supports the displayed head, crown, port, plug, or complete valvetrain geometry. The single-cylinder scene is explicitly schematic. |

## Final component classification

MATCH applies only to the named supported dimension or mathematical invariant. It does not certify the complete mesh. ACCEPTABLE SIMPLIFICATION applies to the disclosed educational purpose. UNKNOWN / NEEDS BETTER REFERENCE identifies missing factory evidence, even when a visible placeholder exists.

| Visible element | Final classification | Factory comparison and remaining gap |
| --- | --- | --- |
| Cylinder / head arrangement | **MATCH** for 101.6 mm bore at the declared scale; **ACCEPTABLE SIMPLIFICATION** for one-cylinder explanation; **UNKNOWN / NEEDS BETTER REFERENCE** for head/deck layout | F1 sheet 6 supplies bore and aluminum 23° heads. The rectangular head and translucent block/liner are display envelopes, not a measured bank section, gasket, or deck. Liner now reaches the schematic head underside. |
| Valvetrain | **ACCEPTABLE SIMPLIFICATION** for intake/exhaust actuator markers; **UNKNOWN / NEEDS BETTER REFERENCE** for full factory assembly | Hydraulic-roller architecture and 1.5 rocker ratio are documented. Lifters, pushrods, rockers, springs, seats, and their coordinates are not modeled. Mirrored valve azimuth is inferred, not a verified Chevrolet arrangement. |
| Intake / exhaust port direction | **ACCEPTABLE SIMPLIFICATION** for separately colored inlet/outlet directions; **UNKNOWN / NEEDS BETTER REFERENCE** for factory routing | Side tubes and curves are schematic. No dimensioned port section supports the positions, angles, bends, or valve-seat relationships. |
| Spark plug location | **UNKNOWN / NEEDS BETTER REFERENCE**; **ACCEPTABLE SIMPLIFICATION** as a timed ignition cue | MR43LTS type and .040 in gap are documented; central vertical body and glow placement are inferred. They do not reproduce electrode reach or insertion angle. |
| Piston crown | **ACCEPTABLE SIMPLIFICATION** as a circular moving boundary; **UNKNOWN / NEEDS BETTER REFERENCE** for factory shape | Flat crown, skirt, rings, wrist offset, and visual radial clearance are inferred. High-silicon aluminum and nominal 10:1 compression do not establish reliefs, compression height, or manufacturing clearance. |
| Connecting rod | **MATCH** for rigid-link closure at the selected center distance; **ACCEPTABLE SIMPLIFICATION** for primitive shape; **UNKNOWN** for original-part dimensions | Fixed 144.78 mm length is **INFERRED** from compatible replacement 19435115 in F4, not VERIFIED for original 10108688. Beam, bearing, joint thickness, and axial offsets are not factory drawings. |
| Crank geometry | **MATCH** for stroke-derived 44.196 mm radius and circular crankpin motion; **ACCEPTABLE SIMPLIFICATION** for one throw | F1 supplies 88.392 mm converted stroke. Shaft, disks, pin thickness, journals, counterweights, and complete V8 phasing remain inferred/unknown. The floor is below the rotating pin throughout the cycle. |
| Chamber proportions | **ACCEPTABLE SIMPLIFICATION** for bounded gas/combustion cue; **UNKNOWN / NEEDS BETTER REFERENCE** for factory chamber | F1 publishes 58 cm³ chamber and nominal compression; the scene does not derive a true chamber or 10:1 volume from them. Glow stays above the crown, below the head, and inside the bore envelope. Shape and opacity do not encode pressure or flame propagation. |
| Valve motion | **MATCH** for documented maximum lifts, diameters, and 23° tilt magnitude; **ACCEPTABLE SIMPLIFICATION** for disclosed timing | Lift follows the tilted stem direction. Intake 0–180° and exhaust 540–720° sine envelopes are INFERRED, not cam-card events. Actual seat events/overlap/ramp shape remain UNKNOWN. Both valves are sampled independently; synthetic overlap is tested without inventing a factory overlap default. |
| Gas-flow paths | **ACCEPTABLE SIMPLIFICATION** as valve-gated directional cues; **UNKNOWN / NEEDS BETTER REFERENCE** for physical flow | Blue inlet and gold exhaust markers share the mechanical sample. They do not simulate pressure, velocity, reversal, leakage, or mass flow. Curves are not factory port geometry or CFD. |
| Ignition / phase indicators | **MATCH** for one educational spark at selected compression-TDC advance per 720°; **ACCEPTABLE SIMPLIFICATION** for presentation | Default 0° advance and six-degree visibility are INFERRED. Published 10°/650 rpm and 32°/4000 rpm setup instructions appear with vacuum-advance conditions; they are not used as a universal spark map. Readout may trail the current render by up to its 100 ms update interval. |

No final visible component is knowingly retained with a proved rigid-link or event-synchronization error. Remaining shape/timing placeholders are disclosed above; they cannot receive factory MATCH status.

## Final rendered checks and review disposition

The existing dark scene, 35° perspective camera, metallic/brass materials, atmosphere, shadows, and hemisphere/key/rim/cool lighting are retained. [Desktop screenshot](images/zz4-desktop.png), [mobile screenshot](images/zz4-mobile.png), and [WebGL fallback](images/zz4-webgl-disabled.png) record the tested production build. These are presentation evidence, not reference images or pixel-perfect test oracles.

Independent review found that the inherited floor hid the crankpin near BDC and the opaque schematic head hid the gas markers. Both were corrected with regressions: floor below the full pin envelope, transparent head through every display mode. Additional regressions bound combustion and spark glow to the schematic gas space and ensure the liner reaches the head. The bounded spark glow is an event marker, not a measured electrode location. Rod endpoint checks use the actual primitive height. Pause/focus/isolate preserve angle; replay explicitly restarts. Stable hooks and renderer cleanup replace the historical conditional-hook/pose-reset behavior.

Browser automation uses Chromium with software rendering. Hardware GPU behavior, every camera angle, measured manufacturing geometry, and physical gas simulation are unverified. See [validation commands and outcomes](ZZ4_VALIDATION.md). The next cinematic asset step is to obtain a matched factory section/CAD and cam/ignition data, then refine this scene's unknown geometry without changing the runtime.

## Historical starting-point audit: exact source identity

Source ref: `origin/static-visual-explainer-mvp`.

Source commit: `05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002`.

The links below are immutable GitHub blob-view URLs pinned to that commit; Git blob object IDs are recorded independently so the exact file content can also be checked locally.

| File and immutable source link | Git blob object ID | Role |
| --- | --- | --- |
| [app/static-explainer/SmartAssetDemo.js](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js) | `b6eac124888b0c1d1c1bbcaffbb56adac1c408e5` | Procedural Three.js geometry, animation, lighting, and controls. |
| [app/lib/assets/smartAssets.js](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/lib/assets/smartAssets.js) | `f3f4e7d81aca1e000638c3b7e0b2af041ddb0fe8` | Generic `engine-piston-v1` semantic parts, capabilities, and states. |
| [app/static-explainer/page.js](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/page.js#L69-L79) | `a3f8f9bc218b41406f0c8703f2f4e76de74762d7` | Shows the generic demonstration before a generated explanation. |
| [app/static-explainer/InteractionRuntime.js](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/InteractionRuntime.js) | `387efed72e88930a0958127d4545804b5366c344` | Separate interaction layer for generated images. |

The renderer was introduced by `e174316f105cf0f83e32c64e0248ca74be515060` and last changed by `7c87ef5`. The same renderer content also exists at `origin/homepage-heart-cards-preview` (`e907ef96327b60553b865048b94e00eacaee60f1`). History containing this work is present on `origin/nahlaty-product-v1`, `origin/prototype-1-adaptive-heart`, `origin/prototype-1-cinematic-heart-3d`, `origin/prototype-1-heart-cinematic-v3`, and `origin/prototype-1-heart-visual-v2`.

All fetched branch heads and their reachable history were searched before the user's clarification. A historical scan examined 558 text blobs, excluding images, embedded image/base64 files, CSS, and lockfiles; no ZZ4, Chevrolet, Chevy, or V8 implementation was found. The 19 advertised pull-request head tips matched already fetched branch tips and supplied no additional target implementation. The user subsequently confirmed the earlier cutaway was uncommitted and authorized this historical runtime as the starting point; the search is complete.

## Historical classification rules

- **MATCH**: the inspected legacy source demonstrates the stated generic property.
- **ACCEPTABLE SIMPLIFICATION**: the geometry can explain the stated limited generic concept if its simplification is disclosed; this is not factory approval or rendered visual approval.
- **WRONG**: source or computed geometry contradicts the mechanical relationship or omits behavior required for the requested explanation.
- **UNKNOWN**: the target, authoritative provenance, or observable evidence needed for comparison is unavailable.

## Historical visual and mechanical elements

| Required element | Observed legacy source and classification | ZZ4 factory comparison | Required follow-through in the authorized integration |
| --- | --- | --- | --- |
| Cylinder / head | **ACCEPTABLE SIMPLIFICATION** for a transparent cylinder liner and block. **WRONG** as a complete cylinder/head explanation: no distinct head, valve seats, ports, or head cutaway is modeled. [Geometry, lines 84–92](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L84-L92). | **UNKNOWN**: bore, head geometry, cylinder/head relationship, and exact section have no verified factory comparison. | Verify the current cutaway's head and cylinder against the selected factory reference before labeling parts. |
| Valvetrain | **WRONG** against the requested valve explanation: no valve or valve-actuation geometry/state exists in the inspected renderer. | **UNKNOWN**: no claim is made about the ZZ4's exact actuation architecture or its shape. | Inspect the current valve actuation path and document each retained or omitted part with provenance. |
| Intake / exhaust port direction | **UNKNOWN** as an architecture comparison because ports are absent. **WRONG** for demonstrating the requested gas path: no inlet/outlet route is drawn or animated. | **UNKNOWN**: port position, angle, and direction have no inspected manufacturer evidence. | Establish actual port direction from the chosen authoritative section; attach flow to that geometry. |
| Spark plug | **ACCEPTABLE SIMPLIFICATION** for a cylindrical ignition marker and glow. **WRONG** for cycle synchronization: ignition is independent of compression-TDC and valve state. [Marker, lines 131–140](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L131-L140); [timing, lines 242–247](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L242-L247). | **UNKNOWN**: plug angle, insertion point, projection, and factory ignition setting are unverified. | Keep an ignition cue, but bind its event to the current asset's verified mechanical cycle; do not invent a factory timing value. |
| Piston crown | **ACCEPTABLE SIMPLIFICATION** for a flat circular crown, skirt, and two decorative rings in a generic motion demonstration. [Lines 94–106](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L94-L106). | **UNKNOWN**: crown profile, reliefs, ring arrangement, dimensions, and provenance are unverified. | Compare the current crown to the selected source; record the exact profile as verified or retain an explicit simplification label. |
| Connecting rod | **WRONG**: a cylinder is resized every frame to the independently animated joint distance; its minimum clamp also breaks endpoint closure. [Lines 234–240](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L234-L240). | **UNKNOWN**: factory rod length, shape, and joint offsets are unverified. The rigid-link failure does not depend on a Chevrolet dimension. | Use one fixed rod length and derive piston position from crank angle and actual joint geometry in the existing target runtime. |
| Crankshaft / crankpin | **MATCH** for a fixed-radius circular crankpin path. **ACCEPTABLE SIMPLIFICATION** for the shaft, paired wheels, and eccentric pin as a generic crank mechanism. It does not demonstrate a complete multi-cylinder crankshaft. [Lines 108–124](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L108-L124); [motion, lines 223–233](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L223-L233). | **UNKNOWN**: factory crank geometry, throw, journals, counterweights, and cylinder phasing are unverified. | Preserve the rotating driver, then validate fixed journals, crank throw, and rod connections on the current asset. |
| Combustion chamber | **ACCEPTABLE SIMPLIFICATION** for an artistic combustion cue inside a transparent enclosure. **UNKNOWN** for a bounded chamber: the constant-position sphere does not establish the head/crown volume or actual chamber shape. [Lines 142–147](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L142-L147). | **UNKNOWN**: chamber contour, volume, and compression geometry lack verified factory evidence. | Make the current chamber boundary readable, distinguish gas/combustion cues from solid geometry, and validate the head/crown relationship. |
| Valve motion | **WRONG** for the requested four-stroke lesson: no lift, opening/closing event, intake state, or exhaust state is implemented. | **UNKNOWN**: exact valve events, overlap, and lift require a verified reference. | Bind visible valve states to the same 720° phase used by piston, ignition, and flow; retain unknown timing as unknown. |
| Intake / exhaust flow | **WRONG**: spark and combustion opacity changes are present, but no gas transport enters a port, crosses an open valve, or exits through exhaust. | **UNKNOWN**: route and port direction have not been compared with factory evidence. | Use existing target geometry and semantic flow capability to demonstrate inlet and outlet directions with the relevant valve state. |

## Reproducible numerical audit of the legacy loop

The running equations at [lines 217–247](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L217-L247) were evaluated at 721 samples: every integer crank degree from 0° through 720° inclusive. Values below are **scene units**, not inches, millimeters, factory dimensions, or measurements from a rendered target. Sample extrema are reported; they are not claimed to be continuous analytical extrema.

| Quantity | Result | Interpretation |
| --- | --- | --- |
| Crankpin local radius | 0.78; maximum floating-point error `1.1102230246251565e-16` | Fixed-radius invariant passes. Radius is calculated from the local offset before adding crank center translation. |
| Piston center | 0.88 to 2.44 | Travel is 1.56 scene units, equal to twice the chosen radius; this alone does not prove rigid-link mechanics. |
| Computed distance between rod joints | 1.161238553 to 3.313213138 | Joint separation varies; the rod cannot remain a fixed-length rigid link under these equations. |
| Rendered rod length | 1.6 to 3.313213138 | `Math.max(1.6, distance)` changes the rendered rod's length and sometimes exceeds the joint separation. |
| Maximum rendered-length / joint-distance mismatch | 0.438761447 | The centered rendered rod overshoots both computed endpoints whenever the minimum clamp is active. |
| Ignition interval | Strictly greater than 306.532420° and less than 335.180310°, repeated every 360° | Derived from `5.35 < phase < 5.85` and modulo `2π`; no separate 720° compression/expansion identity exists. |
| Piston high point / crankpin top | Piston high at 90°; crankpin top at 0° | The independent sine and cosine laws are inconsistent with the inline rigid slider-crank assembled here. |

The core closure defect follows directly from these source equations:

```text
pistonCenter = 0.88 + (sin(theta) + 1) * 0.78
pistonJointY = pistonCenter - 1.2
pinY = -1.7 + cos(theta) * 0.78
pinZ = sin(theta) * 0.78
jointDistance = hypot(pistonJointY - pinY, pinZ)
renderedRodLength = max(1.6, jointDistance)
```

The sweep can be repeated independently without changing the repository or importing the legacy renderer:

```python
import math

rows = []
for degree in range(721):
    theta = math.radians(degree)
    local_y = 0.78 * math.cos(theta)
    local_z = 0.78 * math.sin(theta)
    piston = 0.88 + (math.sin(theta) + 1) * 0.78
    joint_distance = math.hypot(piston - 1.2 - (-1.7 + local_y), local_z)
    rendered_length = max(1.6, joint_distance)
    radius_error = abs(math.hypot(local_y, local_z) - 0.78)
    rows.append((piston, joint_distance, rendered_length,
                 radius_error, rendered_length - joint_distance))

for column, name in enumerate(("piston", "joint_distance", "rendered_length",
                               "radius_error", "endpoint_length_mismatch")):
    values = [row[column] for row in rows]
    print(name, min(values), max(values))
print("ignition_degrees", math.degrees(5.35), math.degrees(5.85))
```

Additional legacy runtime concerns are visible in source. Stop, focus, and isolate reset elapsed time and substitute a fixed pose instead of preserving the mechanical angle; [lines 189–205](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L189-L205) and [225–230](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L225-L230) establish this. A return before `useEffect` at [lines 24–31](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L24-L31) changes hook ordering when a question switches between supported and unsupported assets. Final dispositions appear above.

## Preserve the visual direction

Preserve the premium presentation direction while correcting verified mechanics in the **authorized existing runtime**. Continue its dark scene and atmospheric depth, 35° perspective camera, hemisphere/key/rim/cool lighting, metallic physical materials, shadows, transparent cutaway enclosure, and focused camera view. [Presentation, lines 35–65](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L35-L65); [materials, lines 79–82](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L79-L82); [focus camera, lines 249–259](https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js#L249-L259).

The final integration retains this direction and binds the displayed assembly to one mechanical sample. The final classifications and rendered limits above supersede historical requirements here. Factory-faithful final asset approval still requires better reference geometry; a source identity, numerical sweep, or attractive screenshot cannot grant it.
