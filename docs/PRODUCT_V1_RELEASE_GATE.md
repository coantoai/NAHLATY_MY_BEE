# NAHLATY — Product v1 (bounded paid release)

## Promise
"Ask why a mechanism works; watch the SAME interactive world transform as you continue asking."

## Initial commercial vertical
One coherent heart-flow and valve mechanism experience in Arabic, with grounded free-language AI follow-ups. This is an education product, not medical advice, diagnostics, or a general any-question simulator. Labels and geometry are simplified explanatory representations.

## Existing architecture reused
Next.js 14, three.js, existing Gemini adapter. Product lives on branch nahlaty-product-v1; do not alter current main, current static demo, or merge without owner approval.

## Working v1 slice
- /experience/heart: durable Three.js scene instance with overview, blood-flow, valve, leakage and consequence modes.
- /api/experience/heart: Gemini *intent router* only; authoritative answer and permitted scene transitions are server-owned and allowlisted.
- Conversational context limited to previous questions and current stage; no free-form AI-supplied medical claims or generated executable code.
- Guided fallback stages if Gemini unavailable; explicitly say no AI connection (never fake AI).
- Save locally on the user's device; no unsupported claim of cloud sync or sharing.

## Release blockers before accepting money
- Verified end-to-end deployed session across at least four freely rephrased follow-ups; no stage reset or contradictory state.
- Render and interaction quality validated on mobile and desktop. Current geometry is clearly schematic and needs a visual quality gate before marketing it as cinematic.
- Private beta access protection, server-side per-account quotas, abuse/rate limiting, durable cloud session data, privacy notice and deletion, billing entitlement and webhook verification, cancellation/refund/support policy, and evidence that all assets/fonts are commercially redistributable.
- Target paying educator/learner pilot with explicit offer and price validated with real conversations.
- Pass scientific content review of valve mechanics and test red-team medical prompts; reject personalized diagnosis and unsupported clinical inferences.
- Measure latency, per-session inference cost, completion and repeat-use; product is not ready for public sale solely because a preview URL responds.

## Decision rule
No months of open-ended demos. Make a bounded saleable vertical first, then expand to a second domain to validate generality. No claims that all topics work until tested.
