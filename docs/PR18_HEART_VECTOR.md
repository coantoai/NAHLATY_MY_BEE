# PR #18 heart vector integration

`/lab/premium-heart-vector` loads the existing NIH/NIAID BioArt Human Heart, file 630873, automatically and renders its geometry inside NAHLATY's existing `DynamicScene`. There is no paid generation request or required login.

The original SVG contains 45 anatomical paths and 28 embedded PNG luminance masks. `scripts/prepare-niaid-heart.py` preserves all original path data and transforms, and replaces only those masks with native grayscale SVG paths. The bundled result contains 639 paths and no image elements or raster payloads. Shading is a documented approximation; provenance, input/output hashes, credit and conversion parameters are in `public/heart-vector/niaid-heart.provenance.json`.

Bindings cover the external body and the illustrator's upper, side and lower vessel groups. Body bindings use disjoint paths, so moving or hiding the body cannot implicitly move or hide vessel groups. These group labels are positional, not unverified clinical vessel identities. The adapter forwards actual geometry clicks and keyboard selection to existing runtime buttons, while current runtime state drives focus, visibility and geometry movement. Pixel movement is converted through SVG screen matrices to account for aspect ratio and transforms. Existing generic scenes and home session persistence retain their behavior; the embedded lab does not overwrite a home session.

BPM 40–180 sets the period of an explicitly educational visual pulse to `60/BPM` seconds. Existing Play/Pause pauses the visual animation. This external-view asset has no exposed four-chamber/four-valve cutaway, and no physiological blood-flow overlay is claimed. `semantic.ready` remains **false**; the original 17-point final benchmark is not closed by these external groups.

Scientific validation references:

- https://www.nhlbi.nih.gov/health/heart/anatomy
- https://www.nhlbi.nih.gov/health/heart/blood-flow
- https://bioart.niaid.nih.gov/bioart/228

The physiological SceneSpec retains lungs → oxygenated pulmonary veins → left atrium, with the four valves in the correct circulation order. That specification is kept separate from external geometry that cannot establish those identities.

Verification:

```sh
npm test
npm run build
python3 scripts/qa-heart-runtime.py --url http://127.0.0.1:3019
```

The browser script verifies real geometry selection, keyboard interaction, independent screen-coordinate movement, labels, zoom, BPM endpoints, Play/Pause, Reset and desktop/tablet/mobile sizing. Python browser QA requires Playwright and Chromium. Regenerating the mask conversion requires Pillow and NumPy and an explicitly downloaded copy of the credited source.
