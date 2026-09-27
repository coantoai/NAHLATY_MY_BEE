# NAHLATY — PRODUCT SOURCE OF TRUTH
Version: 2026-09-27 · Status: FROZEN PRODUCT CONTRACT · Master Plan Point 2

## Identity and promise
NAHLATY / MY BEE is an AI Visual Understanding Engine. It transforms a question or other input into an understandable, interactive visual world, then preserves the world's context as follow-up questions evolve it. It is not a dashboard, infographic, text chatbot, or standalone image generator.

Governing principle: **نحرّك المعنى لا الصورة** — animate meaning, not merely pixels.

Central test: Can any question a person wants to understand become a living interactive visual world where image, purposeful motion, camera, depth, light, transitions, scale, zoom, cutaway and transparency explain the subject, and subsequent questions evolve the *same* world and context?

## Canonical journey
Question → Understanding → Visual World → Visual Explanation → Interaction → Follow-up Question → Same World Evolves.

1. Interpret the question and identify the essential explanatory mechanism before generation.
2. Construct a coherent visual world, not an isolated attractive illustration.
3. Explain *inside* the scene. Do not depend on a large prose explanation box. Use minimal words only when indispensable.
4. Use one primary semantic motion, optional restrained micro-motion, and intentional stillness.
5. Make interactions change what the learner can understand: focus, zoom, camera-in, cutaway, transparency, scale, flow, reset.
6. Preserve entities, relationships, visual identity and conversation context on follow-up. Change only what the new question requires.
7. Allow understanding checks and adaptive explanation; do not claim these work until tested.

## Approved product composition
Before a question: cinematic homepage, deep navy / honey gold, prominent 3D bee, sidebar, primary question entry, input modes and examples. The approved bee reference is the homepage *visual benchmark*, not a generic reusable template.

After a question: a large Main Stage, contextual Living Ask Bar, and horizontally navigable visual discovery cards. Selecting a card changes the Main Stage without full-page navigation; the active card is evident. The approved heart storyboard is a *journey reference*, not an image to display as one collage: each stage needs its own coherent visual scene. Card count is not a universal hardcoded rule for every topic.

The explanation is the scene, not a control panel around the scene. Avoid dense cards, a generic central glowing dot, ornamental animation, and hotspots displaying raw object strings.

## Trust and quality
Visuals must represent the underlying mechanism accurately; visual beauty does not excuse a false explanation. Distinguish verified behavior from planned behavior and mark demonstration or generated content appropriately. Test different domains and Arabic language before claiming generality.

## Engineering and change control
Repository: coantoai/NAHLATY_MY_BEE. Working branch: living-visual-engine-v1. Vercel project: nahlaty-my-bee. Read actual repository and deployment state before code changes; neither this document nor prior chat proves a current deployment.

Current image provider decision: Qwen Image 3.0 Standard. Gemini is not the current dependency. Qwen spend ceiling: USD 10 without explicit owner approval. No live-provider calls for exploratory testing without cost awareness.

Preserve the functioning version. Use isolated branches, previews or LAB for experiments. Never overwrite production or merge without explicit approval. Technologies are triaged NOW / LAB / LATER and cannot interrupt the approved build sequence.

## Master Plan execution contract
Point 1 OpenAI Capability Audit: CLOSED by owner-provided handoff. Revisit only for a new concrete technical reason.
Point 2 Source of Truth: this document is the product contract.
Point 3 Audit: classify each existing capability WORKING / BROKEN / MISSING / EXPERIMENTAL based on observed evidence.
Points 4–15: E2E → interactions → Visual Understanding Engine → continuity → semantic motion and spatial interaction → history → reliability/performance/cost → mobile/Arabic/polish → broad cross-domain tests → closed pilot → pilot fixes → launch.

No point is CLOSED until its Definition of Done has objective evidence. A product contract being frozen does not imply any feature is implemented or tested.

## Point 2 Definition of Done
- Product identity, central question, user journey, interaction principles and visual references captured.
- Existing approved engineering, provider, budget and safety constraints preserved.
- Source of Truth committed on the working branch without touching live application code.
- Next step remains Point 3; no premature audit completion or deployment claim.

Change policy: amendments require a dated decision record identifying what changed, why, and impact. Preserve previous decisions unless explicitly superseded.
