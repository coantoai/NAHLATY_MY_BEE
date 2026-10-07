# NAHLATY Runtime Regression Guard

This branch adds a deterministic safety net around the existing Visual Scene Runtime. It does **not** replace the runtime, introduce a new stack, or change production behavior.

## What is guarded

The regression tests lock the current public compiler contract around:

- filtering unknown node/edge/action IDs;
- refusing invalid depth-camera requests;
- refusing follow-camera requests without a valid relation;
- preserving previously revealed scene context;
- keeping semantic motion tied to existing scene nodes;
- preferring stronger causal/factual relations when the runtime must infer an active edge;
- preserving FACT / INFERENCE / UNKNOWN accounting;
- clamping camera distance to the runtime's safe range;
- surfacing visual-overload corrections;
- deterministic compilation for identical input.

## Why this exists

NAHLATY is now running parallel scientific and visual work (engine, heart, and future topics). Those efforts should be free to improve assets and scientific SceneSpecs without accidentally breaking the stable runtime contract.

This suite is therefore a **regression guard**, not a redesign.

## Acceptance

Run:

```bash
npm test
npm run build
```

A PR should not be merged if these regression tests fail.

## Scope boundary

These tests do not prove scientific correctness of a specific heart, engine, plant, or other topic. Scientific truth belongs in the per-topic Scientific Spec / Evidence Ledger. This guard only protects deterministic runtime behavior and fail-safe scene compilation.
