# NAHLATY — Hybrid Visual World LAB
Date: 2026-09-27
Status: Product direction approved for R&D; implementation and unit economics unproven. Isolated LAB. Not a new Master Plan point.

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

## First proof: Bee pollination
Question: كيف تُلقّح النحلة الزهرة؟
- Cinematic flower scene as a single still with two flowers and stable camera/world anchors.
- A transparent bee overlay moves along a semantic trajectory; pollen attaches on landing and transfers at the second flower.
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
