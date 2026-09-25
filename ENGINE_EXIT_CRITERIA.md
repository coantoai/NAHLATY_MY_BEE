# NAHLATY Engine — Exit Criteria

Branch: `visual-engine-proof-v1`

This file defines when the engine milestone may be called complete. It does **not** authorize merging to `main`.

## 1. Core pipeline
- [x] Question input validation.
- [x] Context carried into the next question.
- [x] Sourced knowledge route before model fallback.
- [x] Open-domain Gemini fallback through the existing explanation engine.
- [x] Answer, verification state, Visual Plan and executable scene returned together.
- [x] Provider is replaceable; NAHLATY logic is not coupled to Gemini.

## 2. Trust / verification
- [x] Source-grounded results are explicitly labelled.
- [x] Open-domain model-generated results are explicitly labelled as needing external verification.
- [x] Source links are returned and rendered.
- [x] Truth Anchors are preserved for follow-up explanations.
- [x] No fake confidence percentages.
- [x] Unknown/open-domain content is not silently routed into a heart scene.

## 3. Living world continuity
- [x] Sourced follow-ups stay in the same knowledge pack.
- [x] Open-domain follow-ups carry prior Truth Anchors and causal relations.
- [x] Prior scene node identities are reconciled after model generation.
- [x] Dependent edge/step/camera/action references are rewritten when node identity is preserved.
- [x] Continuity metadata is emitted for diagnostics.

## 4. Visual execution
- [x] Visual Director compiles semantic operations into executable motion.
- [x] Real sceneGraph nodes and edges are rendered.
- [x] FLOW / FOCUS / HIGHLIGHT / CUTAWAY intent reaches the runtime.
- [x] Dynamic explanations support multiple visual steps with next/previous controls.
- [x] Heart proof continues using its dedicated semantic renderer.
- [x] Dynamic topics do not reuse heart scenes.

## 5. Priority sourced domains
- [x] Heart.
- [x] Plant growth.
- [x] Solar cell.
- [x] Bee pollination.
- [x] Four-stroke internal-combustion engine.
- [x] Knowledge-pack graph integrity is enforced by CI.

## 6. Reliability
- [x] Unit/regression tests run before every Next.js build.
- [x] World continuity has regression tests.
- [x] Knowledge-pack graph integrity has regression tests.
- [x] Gemini transient errors are retried by the shared generation layer.
- [x] Engine health endpoint exists.
- [x] Primary E2E probe exists.
- [x] Deep open-domain + follow-up continuity probe exists.
- [x] Diagnostic probes are blocked in production.
- [x] Runtime error monitoring is available through Vercel.

## 7. Safety of delivery
- [x] Work remains isolated on `visual-engine-proof-v1`.
- [x] Production `main` is not replaced or merged automatically.
- [x] Deployment must be READY before handoff.
- [x] CI must be green on the exact handoff commit.
- [x] Runtime errors must be checked after deployment.

## Completion rule

The milestone may be labelled **ENGINE BUILD COMPLETE** only when:
1. every checkbox above is satisfied,
2. the exact latest commit has a successful Vercel build,
3. all automated tests pass on that commit,
4. the latest preview has no engine runtime errors,
5. no known blocker is hidden from the owner.

Any future production-launch work (authentication, durable rate limiting/quotas, billing, production merge, broad external factual grounding for arbitrary topics, analytics/telemetry, and production SLA) is a separate launch milestone and must not be falsely described as already complete.
