# Interactive Vector — FigureLabs handoff

Status: **FAIL / not closed**. This branch prepares the asset pipeline only.
No production UI, runtime, scene, stylesheet, or existing asset was changed.

## Verified input gaps

The 34 available repository branch heads were inspected on 2026-10-05. None
contains the specified heart Interactive Vector Runtime, its state/snapshot API,
or the required heart semantic IDs. The closest static `InteractionRuntime.js`
uses a raster image and at most four anchors; extending it would replace the
requested runtime. `public/visual-benchmark-reference.svg` embeds a JPEG and is
not an editable semantic heart asset. It was not used as a heart reference.

`FIGURELABS_API_KEY` is absent from the managed environment and the connected
`nahlaty-my-bee` Vercel project's environment-variable metadata. No credentials
were invented or copied into the repository. The approved premium heart
reference was not identifiable in the available sources.

## Asset pipeline

Requires Node 24 and Python 3 (standard library only). Set
`FIGURELABS_API_KEY` through server/CI secret configuration, never a `NEXT_PUBLIC_`
variable or a committed file.

```sh
npm run figurelabs:heart -- generate --reference /path/to/approved-heart.png --out /path/to/isolated-heart-assets
```

This uploads the bitmap through `POST /v1/files`, submits
`POST /v1/images/vectorize`, persists the task ID before polling
`GET /v1/tasks/{task_id}`, and downloads the actual SVG. Rerunning with the same
reference/output directory resumes the recorded task without submitting another
paid job. A changed reference needs a different output directory. API bearer
credentials are never sent to the signed download host; signed URLs are not
persisted. The downloaded original is structurally validated before acceptance.

Outputs: `task.json`, `heart-figurelabs-original.svg`, `heart-inventory.svg`,
`node-inventory.json`, and `provenance.json` with SHA-256 hashes and FigureLabs task
identity. There is no fabricated FigureLabs asset, fallback renderer, or
automatic production asset replacement.

Inspect the returned geometry, copy
`scripts/heart-semantic-map.required.json`, and map actual source node IDs to each
semantic group and visual label. Empty mappings deliberately fail. No anatomy is
guessed from a bitmap or anonymous paths.

```sh
npm run figurelabs:heart -- semanticize --svg /path/to/isolated-heart-assets/heart-inventory.svg --mapping /path/to/reviewed-heart-map.json --out /path/to/heart-semantic.svg
npm run figurelabs:heart -- validate --svg /path/to/heart-semantic.svg --semantic
```

The cleanup preserves vector geometry and local gradients, requires independent
groups with the requested IDs, attaches accessible names and label links, and
rejects overlapping/nested mappings or nonconsecutive nodes whose regrouping
would alter paint order. It rejects raster `<image>` and `feImage`, including
hidden content, malformed XML, duplicate IDs, scripts, external resources,
unsafe styles, and unresolved local references. Source stylesheets must be
converted to computed inline styling before mapping: wrapping changes structural
selectors as well as ID selectors. Definition-only or explicitly hidden groups
cannot satisfy the required anatomy.

Flow annotations are a **declared route check**, not proof that geometric paths
follow anatomy. Actual colors, arrow orientation, anatomical structures,
premium appearance, and reference fidelity still need medical and browser review.
`geometryMedicallyReviewed` intentionally remains false in validator output.

## Scientific route

Validated against [NHLBI blood flow](https://www.nhlbi.nih.gov/health/heart/blood-flow)
and [NHLBI anatomy](https://www.nhlbi.nih.gov/health/heart/anatomy):

- Oxygen-poor: body → vena cava → right atrium → tricuspid → right ventricle →
  pulmonary valve → pulmonary artery → lungs.
- Oxygen-rich: lungs → pulmonary veins → left atrium → mitral → left ventricle →
  aortic valve → aorta → body.

Pulmonary veins must be oxygenated. The mapping/validator explicitly enforces
that declaration and the order of both routes. No generated asset has yet been
scientifically approved.

## Evidence and closure gate

`npm run test:interactive-vector`: 35 tests passed after review, covering API
transport/errors, missing credentials, task resumption/provenance, semantic
grouping/labels, XML structure, unsafe/raster rejection, and declared flow routes.
All vector fixtures are tests only; none is a premium heart asset.

The existing full `npm test` command fails on this Node 24 environment because
its pre-existing `--experimental-default-type=module` flag is unsupported.
An alternative run also cannot load `@google/genai` without installing existing
dependencies. Network-enabled dependency installation was interrupted; build
and whole-application regression validation are not reported as passed.

Runtime interaction, focus/zoom/pan/reset, layers, BPM 40–180, play/pause,
state/snapshot continuity, responsive checks, and visual premium approval are
**not verified**. Bind the reviewed real asset through the existing runtime's
asset loader after its exact source/API is supplied. Do not mark the capability
PASS until the complete 17-point benchmark has actual browser evidence.
