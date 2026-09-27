# NAHLATY — Hybrid Visual World LAB
Date: 2026-09-27
Status: Product direction approved for R&D; implementation and unit economics unproven. Isolated LAB. Not a new Master Plan point.

## Owner clarification — TWO INDEPENDENT VISUAL METHODS (2026-09-27)
These are TWO separate R&D streams, not two required layers of one rendering method. Neither requires the other.

**Track A — Native animated vector scene (current bee demo).** Build the whole scene and actors using authored SVG/vector/2D animation. Improve the current demo's visual quality, cinematic palette, coherent bee facing/orientation along its path, automatic smooth action and scientifically meaningful pollen transfer. It does NOT need a generated cinematic still or external transparent assets to work. The current /hybrid-bee-lab proof belongs HERE.

**Track B — Cinematic still + independent transparent motion assets.** Generate or source a beautiful realistic/cinematic BASE IMAGE, then compose independently sourced, authored or generated transparent animated assets over it. Adapt color, shading, perspective, size, orientation, timing, occlusion and contact/shadow to match. This is a different method to be PROTOTYPED SEPARATELY; its matching quality and unit economics are UNPROVEN. An alpha channel or grayscale tint alone does not solve illumination, shadows or camera perspective.

A future Visual Router may choose A or B (or other media) on explanatory fit, fidelity, mobile cost and measured expense. Do not silently replace Track A with Track B or describe the present Track A demo as proof of Track B. Neither medium is assigned to a subscription tier yet.

## The promise
A person asks about something, then can inspect its interior, move or focus its parts, change its conditions and keep exploring within the same coherent visual world. This interaction must teach causality, not add decorative movement.

## Candidate architecture — do not commit prematurely
1. Understanding layer: identify subject, causal mechanism, user intent, scientifically constrained objects and relationships.
2. Visual Router chooses the lowest-cost medium that truly explains it: semantic SVG / animated vector; layered cinematic still / 2.5D; reusable interactive 3D; alpha-overlay animation; short generated video only when the motion cannot be explained comparably with lighter media.
3. Main scene: Qwen-generated cinematic image when suitable, not a compulsory medium.
4. Semantic scene graph: persistent world ID, object IDs, anchors and layers; world coordinates and relative position/depth for overlays; trigger/state changes.
5. Motion layer: composited alpha SVG/Lottie/canvas sprites or reusable 3D objects. Start with authored/keyframed assets; assess generated small assets and rented GPUs ONLY against measured latency, quality, licensing and marginal cost. Do not assume GPU is cheaper.
6. Follow-up layer: preserve established truth/identity, animate a meaningful state change, reframe with camera/zoom/cutaway as needed; use regeneration only for a change an existing world cannot express.
7. Visual QA: check perspective, scale, occlusion, grounding/contact, palette, lighting, shadows, continuity, legibility and factual accuracy. Transparent background does not itself match lighting or perspective. Monochrome/recolor is a useful style option, not a universal lighting solution.
8. Economics: cache and reuse assets, log generation cost separately from playback, limit paid calls, benchmark mobile performance.

## First proof — Track A: native animated vector pollination
Question: كيف تُلقّح النحلة الزهرة؟
- A self-contained authored vector scene with two flowers and stable world anchors; target more natural detail, composition and cinematic color without requiring a separate generated still.
- An authored vector bee moves automatically along a smooth semantic trajectory, visibly turns/faces the destination during motion and landing; pollen attaches on landing and transfers at the second flower.
- Tap the bee or pollen to focus and expose the causal mechanism IN the scene using only essential text.
- Ask: ماذا يحدث لو لم تنتقل حبوب اللقاح؟ The same scene stays recognizable; the transfer state visibly changes. Avoid creating a disconnected second image.
- Optional: a simple cutaway or macro focus on stigma/pollen, only when scientifically useful.
- Start with lightweight authored vector/sprite animation; no paid GPU/video by default.

## Proof gates — LAB is not CLOSED without evidence
- Functional scene renders with visibly consistent placement, no obviously pasted-on overlay.
- Bee flight, landing, pickup and transfer visibly convey pollination; interaction changes a causal state, not just appearance.
- A follow-up preserves subject/world identity and yields a distinct visual change.
- Works on typical mobile viewport; reasonable reduced-motion fallback.
- Exact source/license for each third-party asset recorded.
- Log first-view latency and marginal cost per question, follow-up and playback, then compare quality/cost with a short video baseline if spend is approved.
- Do not spend beyond the owner's USD 10 Qwen ceiling, and do not provision paid GPU without explicit cost approval.
- QA must distinguish working code from an actual rendered, tested demo.

## Where this returns to the Master Plan
Point 3 audit existing motion, renderer, scene graph and assets.
Point 6 visual understanding and router.
Point 7 continuity of the same world across follow-ups.
Point 8 meaningful 2.5D/vector/3D motion, camera, zoom, cutaway and interactive layers.
Point 10 latency, cost controls, caching and asset reuse.
Point 12 diverse tests of visual truth, UX and cost.
This LAB runs on its own preview/branch; it must not stall the main BUILD → LAUNCH path. Promote only after the proof gates, with any material architecture/provider change requiring an owner Decision Gate.


## Implementation checkpoint — 2026-09-27
- Isolated branch: lab/hybrid-bee-pollination.
- Draft PR: https://github.com/coantoai/NAHLATY_MY_BEE/pull/10, targeted to nahlaty-build-orchestrator; NOT merged.
- Route: /hybrid-bee-lab; authored SVG botanical world + transparent semantic bee/pollen overlays.
- Stable bee/world identities; step selection and bee/flower hotspots; blocked-versus-allowed pollen transfer via simple Arabic follow-up intent fixture. This is a limited deterministic authored demo, NOT general AI continuity or Qwen photorealistic compositing.
- GitHub CI run https://github.com/coantoai/NAHLATY_MY_BEE/actions/runs/36325450376 succeeded: 72/72 tests, Next build and production smoke. Next built /hybrid-bee-lab.
- Vercel branch preview READY at https://nahlaty-my-j8jkjzlvi-coantoai-9460.vercel.app/hybrid-bee-lab . Preview's direct external inspection returned login_required, so visual/browser interaction is UNVERIFIED. A verified preview build is not proof of UX quality.
- No paid Qwen/GPU generation was performed by this prototype.
- Next for Track A: authorized browser QA, improve auto-orientation, fully automatic smooth meaningful motion and visual polish while retaining authored vector rendering. Separately begin Track B as its OWN cinematic-still-plus-transparent-assets proof, test color/lighting/perspective/occlusion and compare its real latency/cost; do not mistake Track A for evidence that Track B works. No automatic promotion to Work's current main execution branch.


## Two separate v2 proofs — 2026-09-27
The following are experiments, NOT production features and not a universal world engine:
- Track A native vector: /vector-bee-v2 — richer authored vector flowers/bee, requestAnimationFrame automatic flight, gradual facing aligned to the flight tangent, visual pollen carry/transfer, pause/speed and bounded Arabic counterfactual. No photo dependency.
- Track B photo + transparent independent asset: /photo-overlay-v2 — an actual separately sourced Pexels photograph (photo 17516957) used as the cinematic still; independently authored transparent SVG bee in public/visual-lab/bee-transparent.svg, animated wings, flight overlay, manually adjustable flower anchors, warmth/size controls, and bounded causal transfer. No claim of automatic matching, physically correct occlusion or photorealistic bee rendering.
- Shared flight sampler lib/pollination-flight-v2.js, with semantic-state tests; no new rendering dependency, paid GPU or Qwen call.
- Branch lab/visual-methods-v2; draft PR https://github.com/coantoai/NAHLATY_MY_BEE/pull/11, targeted to the earlier LAB branch; NOT merged.
- GitHub CI https://github.com/coantoai/NAHLATY_MY_BEE/actions/runs/36328121776: 77/77 tests, build and HTTP smoke all pass.
- Vercel branch preview READY: https://nahlaty-my-rjxpag5qh-coantoai-9460.vercel.app/vector-bee-v2 and https://nahlaty-my-rjxpag5qh-coantoai-9460.vercel.app/photo-overlay-v2.
- Both URLs returned login_required to an unauthenticated external browser. Actual screenshot, animation smoothness, photograph resolution and color/light matching are not yet browser-verified. A green CI/build is NOT visual acceptance.
- Photography license: Pexels standard license for https://www.pexels.com/photo/two-pink-flowers-in-a-field-with-green-grass-17516957/ ; do not resell bare photography or treat Pexels as an unrestricted redistributable stock library.
- Owner approval required before promoting any of this LAB to Work's active branch or replacing the default renderer.
