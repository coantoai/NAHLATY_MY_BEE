---
name: nahlaty-build
description: Execute, review, or continue the NAHLATY / MY BEE Build-to-Launch plan while preserving its Source of Truth, Definition of Done, engineering safety rules, visual constitution, and decision gates.
---

# NAHLATY BUILD

Use this skill whenever work changes, reviews, tests, deploys, or plans NAHLATY / MY BEE.

Before acting, read:
- references/source-of-truth.md
- references/master-plan.md
- references/hybrid-visual-world-lab.md (approved visual R&D direction; LAB, not automatic replacement of the current engine)
- references/visual-production-ideas-2026-09-27.md (verified R&D ideas, NOW/LAB/LATER; no silent vendor or product change)
- references/execution-rules.md

## Operating loop
1. Identify the current Master Plan point and its Definition of Done.
2. Inspect current evidence/state before modifying anything. Never assume an old deployment, branch, test, or integration state is still current.
3. Classify new ideas or technologies as NOW, LAB, or LATER. LAB must not derail the main execution path.
4. Prefer existing connected tools and proven project infrastructure over rebuilding equivalent capability.
5. Make the smallest safe change on an isolated branch/preview when experimentation could affect the working product.
6. Test the result against the current point's Definition of Done and the Source of Truth.
7. If a test fails and the cause is actionable with available access, fix and retest rather than merely reporting it.
8. Close a Master Plan point only when its Definition of Done is evidenced.
9. Continue to the next point unless a Decision Gate requires owner approval.

## Decision Gates — stop for owner approval
Stop before:
- changing the product's central Source of Truth;
- replacing a core engine/provider as the default;
- merging to production/main or launching publicly when not already explicitly authorized;
- exceeding an agreed spending limit;
- destructive/irreversible actions;
- decisions with materially different product directions where evidence does not resolve the choice.

Do not ask the owner to perform steps that connected tools can safely perform.

## Non-negotiable visual rule
NAHLATY is an AI Visual Understanding Engine, not a dashboard, infographic, text chatbot, or generic image generator.
The explanation itself is the visual scene.
Animate meaning, not decoration.
Use text inside the visual only when essential to understanding.
Preserve the same visual world's context across follow-up questions whenever the user's intent requires continuity.
