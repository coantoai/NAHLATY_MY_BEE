# Issue #22 QA implementation plan

**Goal:** Preserve reproducible engineering evidence without replacing the existing runtime.
**Authority:** [Issue #22](https://github.com/coantoai/NAHLATY_MY_BEE/issues/22).
**Architecture:** Execute the historical `SmartAssetDemo` animation function in a small Three.js scene fixture. Inspect its actual transforms over 720°, without reimplementing piston equations. This diagnostic is not the missing current ZZ4 runtime and does not certify factory accuracy.
**Stack:** Existing Node test runner and Three.js; no new dependencies.

## Constraints and review focus

- Use branch `codex/issue-22-zz4-science-lock`; leave application source and assets intact.
- Pin the historical commit, path, and full Git blob ID; refuse a different source.
- Report mechanical PASS/FAIL separately from UNKNOWN factory dimensions and unavailable valve checks.
- Sample the inclusive 0–720° interval in 1° increments, with a 1e-9 scene-unit tolerance.
- Execute the production animation function; camera, labels, and rendering are fixture boundaries, not visual validation.
- Return nonzero from the diagnostic for demonstrated mechanical failures.
- Never use existing application's passing tests as proof of engine accuracy.

## Task 1: Reproduce the legacy animation defects

Files: `scripts/qa-legacy-engine.mjs`, `tests/legacy-engine-qa.test.mjs`.
Interface: `auditLegacyEngine()` returns target identity, sample count, measured extrema, and checks with `PASS`, `FAIL`, or `UNKNOWN` status.

- [x] Write tests requiring radius invariance, measured variable rod length, rendered joint mismatch, incorrect dead-center phase, two spark windows per 720°, and explicit unavailable valve/factory results.
- [x] Run the tests before implementation and confirm the diagnostic is missing.
- [x] Implement a source-pinned animation fixture and inspect actual Three.js transforms. Archive the exact source as a non-executable test fixture so shallow clones work.
- [x] Run the complete test suite and the standalone diagnostic. The legacy suite passes; the diagnostic exits 1 with the observed defects.

## Task 2: Adapt and validate the existing runtime

The user confirmed there is no committed ZZ4 cutaway and authorized adapting the historical runtime within the current application. Official Chevrolet documentation is now retrievable. Use `ZZ4_SCIENCE_LOCK.md` as the implementation specification. The compatible-rod inference and unavailable timing/shape data remain explicitly disclosed.

- [x] Adapt the existing Three.js cinematic scene with a pure state sampler and a mesh adapter; preserve the Next.js/React/Three.js stack and existing application routes.
- [x] Add regression tests before correcting justified discrepancies; retain RED→GREEN evidence for the model and mesh adapter.
- [x] Verify rod/crank endpoint invariance, documented stroke, dead centers, all four strokes and the 720° wrap, independent valve windows and overlap capability, configurable educational ignition, and shared mesh state.
- [x] Check actual browser pause/replay/focus/isolate behavior and the WebGL fallback.
- [x] Run full tests/build and inspect the existing cinematic asset.
- Delivery: open the linked Draft PR; do not merge. The GitHub PR association with Issue #22 records this handoff.

Final test/build/browser results are recorded in `ZZ4_VALIDATION.md`. Passing the declared motion model does not resolve unknown factory timing or geometry, and the historical diagnostic is not acceptance evidence for the adapted scene.
