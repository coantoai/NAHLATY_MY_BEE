# NAHLATY / MY BEE — Product Journey Exit Criteria

Branch: `visual-engine-proof-v1`

This milestone begins after `ENGINE BUILD COMPLETE`. It defines when the engine is considered integrated into the real My Bee product journey.

## 1. Homepage → Journey
- [x] Approved homepage remains the visual source of truth.
- [x] Homepage Ask Box is a real form, not only a hotspot.
- [x] Enter/submit sends the user's input into NAHLATY Engine.
- [x] A question goes through the question path.
- [x] Pasted/long-form content goes through the content path.
- [x] Image/PDF/text analysis can still feed extracted content into the same engine gateway.
- [x] Voice transcription still feeds the same content state.

## 2. Engine → Living Visual Experience
- [x] The real product uses `/api/engine` for the first explanation.
- [x] Engine results are unwrapped into the existing rich visual runtime.
- [x] Source-grounded metadata is preserved in the product.
- [x] Open-domain model-generated status is preserved in the product.
- [x] Audience profile is attached to sourced experiences without an extra model call.
- [x] Existing 2D/3D, simulation, learning director, memory and scene tools remain reusable.

## 3. Heart proof journey
- [x] “كيف يعمل القلب؟” is a sourced visual experience.
- [x] Heart journey contains exactly 10 stages.
- [x] A focused heart question starts on the relevant stage.
- [x] The 10 stages remain swipeable/selectable as journey cards.
- [x] Sources remain available.

## 4. Living Ask
- [x] Living Ask Bar appears inside the active explanation.
- [x] Follow-up does not return to Homepage.
- [x] Follow-up sends Truth Anchors.
- [x] Follow-up sends causal relations.
- [x] Follow-up sends scene node identities.
- [x] Sourced worlds remain sourced when possible.
- [x] Open-domain worlds use the continuity reconciler.

## 5. Focused product state
- [x] Homepage is hidden once the visual journey begins.
- [x] Traditional composer is hidden during the active journey.
- [x] Main Stage remains the visual focus.
- [x] Living Ask sits directly after the visual stage.
- [x] Journey cards support horizontal swipe.
- [x] User can start a new question without a page refresh.

## 6. Trust
- [x] Source links are visible in the trust layer.
- [x] Source-grounded and model-generated states are not conflated.
- [x] Truth Anchors remain visible.
- [x] No fake confidence percentage is introduced.

## 7. Regression / delivery
- [x] Product journey contract is covered by CI.
- [x] Heart 10-stage journey is covered by CI.
- [x] Long-form engine gateway is covered by CI.
- [ ] Latest exact commit passes all tests.
- [ ] Latest exact commit compiles successfully.
- [ ] Latest exact commit reaches Vercel READY.
- [ ] Root page responds successfully on the branch alias.
- [ ] `/api/engine` self-test passes on the branch alias.
- [ ] Vercel reports no new runtime errors after the final deployment.

## Completion rule

Label this milestone **PRODUCT JOURNEY COMPLETE** only after all delivery checks above are verified on the exact handoff commit.

This still does not authorize merging into `main` or claim commercial production readiness. Production launch hardening (durable auth/quotas/billing/telemetry/SLA and broad external grounding) remains a separate launch milestone.
