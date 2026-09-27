# Execution rules

## Roles
- Work: long-running execution/orchestration and cross-tool completion.
- Codex: implementation, debugging, tests and repository changes.
- GitHub: source control, PRs, issues and CI evidence.
- Vercel: preview/deployment evidence and runtime diagnostics.
- Figma: visual design handoff when useful.
- Context7: current library/API documentation when implementation depends on changing APIs.
- TinyFish / browser tooling: requested browser workflows and E2E checks when appropriate.
- Runway: LAB/visual-motion capability when it materially improves understanding.
- OpenAI Developers: current OpenAI platform integration guidance.
- Superpowers: engineering workflow support; it does not override this Source of Truth.

## Safety
- Preserve the working product.
- Prefer preview branches for experiments.
- Never infer success from a commit alone: verify behavior.
- Never claim a deployment/test/integration is current without checking.
- Keep production merge/release behind an explicit Decision Gate unless already authorized for that exact action.

## Build discipline
- Main path first; experiments belong in LAB.
- New technology must solve a demonstrated problem before entering the main architecture.
- Reuse proven auth, persistence, monitoring and visual-engine infrastructure where compatible.
- Avoid duplicate frameworks/providers that add no clear capability.

## Point 2 Definition of Done
Point 2 can close when:
1. the Source of Truth is written and internally consistent;
2. the central question, core journey, visual constitution, continuity rule, and anti-patterns are explicit;
3. current engineering anchors and provider constraints are recorded;
4. future implementation can be judged against these rules without reinterpreting the product.

Later points must define their own measurable Definition of Done before implementation begins.
