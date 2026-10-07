# Heart evidence ledger

Recorded on 2026-10-07 for Issue #23. This ledger distinguishes established physiology, repository asset evidence, authored conventions and information the scene cannot establish.

## Scientific references

| Source ID | Reference | Used for | Verification status |
| --- | --- | --- | --- |
| `nhlbi-anatomy` | [NHLBI — Heart anatomy](https://www.nhlbi.nih.gov/health/heart/anatomy) | Four chambers, septum and myocardium | Official HTML retrieved with TLS verification on 2026-10-07; supporting text inspected |
| `nhlbi-blood-flow` | [NHLBI — Blood flow through the heart](https://www.nhlbi.nih.gov/health/heart/blood-flow) | Four valves and their locations, venae cavae, normal directed circuit and oxygenation | Official HTML retrieved with TLS verification on 2026-10-07; supporting text inspected |
| `nhlbi-heart-beats` | [NHLBI — How the Heart Beats](https://www.nhlbi.nih.gov/health/heart/heart-beats) | Ventricular contraction within the described heartbeat cycle | Verified HTTPS GET returned 200 on 2026-10-07; supporting text inspected |
| `openstax-heart-anatomy` | [OpenStax — Heart Anatomy, official publisher source](https://github.com/openstax/osbooks-anatomy-physiology/blob/5ae32b3f4bc24ed003e91dc38bf47dba80751044/modules/m46676/index.cnxml) | Relative ventricular wall muscle; pulmonary trunk branching; passive ventricular filling; pressure-related valve motion and AV-valve support | Official OpenStax repository XML retrieved with TLS verification on 2026-10-07 at pinned revision; paragraphs `fs-id2183171`, `fs-id2151950`, `fs-id2769216`, `fs-id1435292`, `fs-id1291612`, `fs-id2795451` inspected |
| `openstax-cardiac-physiology` | [OpenStax — Cardiac Physiology, official publisher source](https://github.com/openstax/osbooks-anatomy-physiology/blob/5ae32b3f4bc24ed003e91dc38bf47dba80751044/modules/m46672/index.cnxml) | Cardiac output identity and variability of stroke volume | Official OpenStax repository XML retrieved with TLS verification on 2026-10-07 at pinned revision; paragraphs `fs-id2068372`, `fs-id1505346` and `fs-id1862411` inspected |
| `niaid-bioart-228` | [NIH/NIAID BioArt — Human Heart](https://bioart.niaid.nih.gov/bioart/228) | Credited exterior illustration and asset provenance | Official HTML retrieved with TLS verification on 2026-10-07; Public Domain, creator and credit inspected |

The official NIH/NHLBI source pages were successfully fetched after network configuration was updated. The previously observed proxy denial is resolved for those hosts. Direct OpenStax website and NCBI Bookshelf requests were attempted but denied at proxy CONNECT; the supplementary textbook evidence was instead retrieved from OpenStax's own public publisher repository, an independently permitted official distribution channel. No unofficial mirror or network tunnel was used.

`git ls-remote` confirmed the publisher repository HEAD as `5ae32b3f4bc24ed003e91dc38bf47dba80751044`. The repository's `collections/anatomy-and-physiology-2e.collection.xml` places the cited modules in “The Cardiovascular System: The Heart”; the source document titles are “Heart Anatomy” and “Cardiac Physiology”. The immutable GitHub revision links above identify exactly the reviewed text. Only short attributed excerpts and links are included here; textbook source files or artwork were not copied into the repository.

Source verification means that supporting text was inspected in retrieved official HTML or publisher XML; it does not mean clinical review, publisher endorsement, or geometric certification of the authored cutaway.

## Exact official-source excerpts

The following quotations preserve the source wording; whitespace and HTML formatting are normalized.

From NHLBI anatomy:

> It has four hollow chambers surrounded by muscle and other heart tissue.

> An internal wall of tissue divides the right and left sides of your heart. This wall is called the septum.

> Myocardium is the thick middle layer of muscle that allows your heart chambers to contract and relax to pump blood to your body.

From NHLBI blood flow, “Heart valves”:

> The heart has four valves.

> The tricuspid valve separates the right atrium and right ventricle.
>
> The mitral valve separates the left atrium and left ventricle.
>
> The pulmonary valve separates the right ventricle and the pulmonary artery.
>
> The aortic valve separates the left ventricle and aorta.

From NHLBI blood flow, “Adding oxygen to blood”:

> Oxygen-poor blood from the body enters your heart through two large veins called the superior and inferior vena cava.

> The pulmonary artery then carries the oxygen-poor blood from your heart to the lungs. Your lungs add oxygen to your blood. The oxygen-rich blood returns to your heart through the pulmonary veins.

> The oxygen-rich blood from the lungs then enters the left atrium and is pumped to the left ventricle.

From NHLBI heartbeat:

> The AV node fires another signal that travels along the walls of your ventricles, causing them to contract and pump blood out of your heart.

This supports ventricular pumping during the described heartbeat cycle. It does not specify numerically identical contraction onset or an exact animation phase duration.

From OpenStax Heart Anatomy, paragraph `fs-id2183171` at the pinned publisher revision:

> Although the ventricles on the right and left sides pump the same amount of blood per contraction, the muscle of the left ventricle is much thicker and better developed than that of the right ventricle.

This explicitly verifies the relative wall-muscle comparison missing from the retrieved NHLBI pages. It does not establish a numeric thickness ratio for the authored SVG.

From the same OpenStax anatomy module, paragraph `fs-id2151950`:

> When the right ventricle contracts, it ejects blood into the pulmonary trunk, which branches into the left and right pulmonary arteries that carry it to each lung.

This supports the more precise aggregate label “Pulmonary trunk and arteries” while preserving the existing `heart.pulmonaryArtery` concept ID and route.

Paragraph `fs-id2769216` describes filling:

> Most blood flows passively into the heart while both the atria and ventricles are relaxed, but toward the end of the ventricular relaxation period, the left atrium will contract, pumping blood into the ventricle.

Paragraph `fs-id1435292` describes the valve relationship during ejection:

> a shows the atrioventricular valves closed while the two semilunar valves are open. This occurs when the ventricles contract to eject blood into the pulmonary trunk and aorta.

Paragraph `fs-id1291612` describes AV-valve closure and support:

> This backflow causes the cusps of the tricuspid and mitral (bicuspid) valves to close.

> This creates tension on the chordae tendineae (see b), helping to hold the cusps of the atrioventricular valves in place and preventing them from being blown back into the atria.

Paragraph `fs-id2795451` describes pulmonary-valve closure:

> When the ventricle relaxes, the pressure differential causes blood to flow back into the ventricle from the pulmonary trunk. This flow of blood fills the pocket-like flaps of the pulmonary valve, causing the valve to close and producing an audible sound.

These passages support pressure-related passive leaflet motion, AV support against prolapse and the opposing valve states during ventricular ejection. The animation does not measure pressures, full phase durations or valve kinetics; its chordae tendineae and papillary muscles are omitted. The sources do not certify the authored valve paths or normalized timing fractions.

From OpenStax Cardiac Physiology, paragraph `fs-id2068372`:

> To calculate this value, multiply stroke volume (SV), the amount of blood pumped by each ventricle, by heart rate (HR), in contractions per minute (or beats per minute, bpm).

The following paragraph, `fs-id1505346`, gives:

> CO = HR × SV

Paragraph `fs-id1862411` states:

> A mean SV for a resting 70-kg (150-lb) individual would be approximately 70 mL.

It also lists individual variables and a normal range of 55–100 mL. This supports the scale of the educational default, while showing why fixing it at 70 mL across the BPM slider is an assumption rather than an individual measurement or a universal physiological constant.

From the NIAID BioArt Human Heart page:

> Licensing: Public Domain

> Creator
> Ryan Kissinger

> Credit
> Courtesy of NIAID

## Claim register

These identifiers match `HEART_SCIENCE_LOCK.claims` in `app/lib/heartSemanticVector.js`.

| Claim ID | Knowledge | Evidence or limit |
| --- | --- | --- |
| `four-chambers-four-valves` | `fact` | Source-supported: NHLBI anatomy establishes four chambers; NHLBI blood flow establishes four valves and their exact locations |
| `normal-directed-flow` | `fact` | NHLBI blood flow establishes the closed body → right heart → lungs → left heart → body circuit; OpenStax anatomy identifies pulmonary trunk branching into left/right arteries |
| `pulmonary-oxygenation` | `fact` | NHLBI blood flow; pulmonary artery oxygen-poor, pulmonary veins oxygen-rich |
| `vessel-direction` | `fact` | NHLBI blood flow; artery/vein naming follows direction relative to the heart |
| `vena-cava-return` | `fact` | Source-supported: NHLBI blood flow names superior and inferior vena cava and right atrial return; separate geometry remains authored |
| `ventricular-separation` | `fact` | NHLBI anatomy; no direct right-to-left chamber route in this normal postnatal scene |
| `left-ventricular-wall` | `fact` | Source-supported: OpenStax Heart Anatomy explicitly compares left/right ventricular muscle thickness; NHLBI blood flow supports left ventricular/aortic outflow. No numeric SVG thickness ratio is verified |
| `paired-ventricular-pumping` | `fact` | Source-supported: NHLBI heartbeat describes the ventricular contraction phase; precise simultaneity and depicted timing are not measured |
| `pressure-driven-valves` | `fact` | OpenStax anatomy describes pressure/backflow-driven closure, open semilunar and closed AV valves during ejection, and chordal support against AV prolapse |
| `valve-support-simplification` | `inference` | Schematic leaflets omit chordae tendineae and papillary muscles; valve poses illustrate filling/ejection rather than measured kinetics or the complete pressure-based cycle |
| `red-blue-convention` | `inference` | Diagram encoding only; blood itself is red, including oxygen-poor venous blood |
| `illustrative-geometry` | `inference` | Original authored educational paths and layout; not a measured or clinically certified reconstruction |
| `illustrative-timing` | `inference` | Normalized timeline and animation pacing; no measured hemodynamics, pressure, transit time or physiological phase-duration response to changing heart rate |
| `fixed-stroke-volume` | `inference` | Explicit 70 mL/beat assumption for deterministic educational cardiac-output arithmetic |
| `individual-stroke-volume` | `unknown` | Individual physiology, pathology, ejection fraction, coronary perfusion and exercise response are not estimated |

The cardiac-output parameter separately records `formulaKnowledge: "fact"` and `formulaSourceIds: ["openstax-cardiac-physiology"]`. Its displayed estimate remains `knowledge: "inference"` because the scene fixes stroke volume at 70 mL.

Per-concept source IDs and runtime primary URLs now distinguish the inspected evidence: NHLBI anatomy for chambers/myocardium, NHLBI blood flow for named valves/great vessels and lung/body context. OpenStax supplies the supplementary trunk-branching, wall comparison and valve-mechanism evidence above. A general anatomy URL alone is not evidence for every displayed structure or physiology claim.

## Preserved exterior asset provenance

The bundled source is `public/heart-vector/niaid-heart.svg`; its conversion record is `public/heart-vector/niaid-heart.provenance.json`. Both the SVG's original embedded metadata and the JSON identify **Human Heart**, **Ryan Kissinger**, **Courtesy of NIAID**, **Public Domain**. The recorded original download URL is `https://bioart.niaid.nih.gov/api/bioarts/228/files/630873`.

| Local evidence | Observed value |
| --- | --- |
| Original input SHA-256 recorded by converter | `e2260fd13db30aae8f5a4ab4df1fbbf3582c6599315b8380cac08bfe832d9aa9` |
| Bundled SVG SHA-256, recomputed and matched to provenance | `a8d968b2239391333156180456a4b022920b0cd8971756f7d1c4d8cc132b5f1c` |
| ViewBox | `0 0 289.44 406.42` |
| Bundled bytes | 592,486 |
| Preserved original anatomy paths | 45; each path-data hash matches the local provenance record |
| Total native paths | 639 |
| Original raster luminance masks converted to vectors | 28 |
| Remaining masks and filters | 28 of each; all referenced local SVG IDs resolve |
| Raster image elements / raster payloads | None |
| `clipPath` elements | None; this artwork uses masks for shading |
| Exterior runtime semantics | Four positional groups, zero asserted flow edges; `semantic.ready: false` |

The converter preserves original anatomy paths and transforms. It approximates embedded PNG shading masks with grayscale native vector paths. This disclosure is in both SVG metadata and the JSON provenance. Local hash agreement proves that the bundled artifact matches its recorded conversion; it does not independently prove that the originally downloaded file matches today's official endpoint. The original input file was not re-downloaded during this task.

Public Domain, Ryan Kissinger and Courtesy of NIAID are now supported by both the freshly retrieved official BioArt page and bundled metadata/provenance. Credit is retained. The original downloaded SVG was not freshly compared against the official asset endpoint; the source-page license check and local artifact hash checks establish different facts. The project's generated or cinematic reference images have no independently verified source-license record here and must not be presented as NIH-certified scientific evidence.

## Original cutaway boundary

`HEART_ANATOMY_BINDINGS` applies to the separately authored educational cutaway, not to `top_vessels`, `left_vessels`, `bottom_vessels` or exterior anatomy paths in the preserved NIH file. The new geometry must have its own authorship/license provenance, disclose schematic simplifications and retain scientific-source attribution. NIH credit belongs to the preserved NIH reference; it must not imply NIH created, reviewed or endorsed the new internal cutaway.

The semantic suite checks the intended scientific and ID contract. Asset integrity and browser QA separately establish element uniqueness, visible anatomy, clipping, selection, movement, layers, playback, reset and responsive behavior. Passing automated checks is not a medical-review certification.
