# NAHLATY Scientific Validation Protocol

## Core rule
Scientific and technical correctness has veto power over visual attractiveness, implementation convenience, and speed.

## Evidence classes
- **FACT** — directly supported by authoritative evidence.
- **INFERENCE** — reasonable conclusion derived from evidence.
- **UNKNOWN** — not verified or insufficiently supported.

Never silently promote INFERENCE or UNKNOWN to FACT.

## Source hierarchy
1. OEM / manufacturer service manual, engineering documentation, official specification.
2. Government, standards body, university, peer-reviewed or authoritative technical source.
3. Reputable technical manual / specialist reference.
4. Secondary explanatory source.
5. Community content only as weak support, never the sole authority for critical claims.

## Geometry
Never invent hidden internal geometry because it looks plausible.

If internal passages, casting paths, lumen geometry, hidden routing, or depth are not verified:
- show only what is supported by the current view, or
- label hidden geometry as schematic / teaching projection, or
- change viewpoint / use cutaway / 3D.

## Motion
Every animated element must answer:
- What moves?
- Why does it move?
- In what direction?
- Under what condition?
- Is the sequence/timing technically valid?

Decorative motion must never imply false physics.

## Flows
For fluid, gas, blood, current, heat, force, or signal, verify:
- source
- destination
- direction
- containment/path
- state/phase conditions
- color semantics
- front/back occlusion

## System state
Each state must define:
- inputs
- active components
- inactive components
- transitions
- constraints
- observable effects

Impossible simultaneous states are prohibited.

## Troubleshooting
A diagnostic flow must use a real symptom and real failure modes.

Each diagnostic step includes:
- observation
- hypothesis
- check
- expected result
- interpretation
- next branch
- confidence/evidence class

Do not jump from symptom to diagnosis without checks.

## Safety
Where physical, electrical, thermal, chemical, medical, mechanical, or operational risk exists:
- surface the risk
- require authoritative source/manual for critical actions
- avoid unsafe detail if conditions are unknown
- never imply certainty when confidence is insufficient

## Visual truth
If a concept cannot be shown accurately in the current 2D viewpoint, do not force it.

Choose:
- visible truth only
- transparent/cutaway view
- new perspective
- 3D
- explicitly labeled schematic mode

## Validation gates
A feature passes only after:

### Scientific PASS
- claims verified
- relationships and directions valid
- no fabricated hidden detail
- uncertainty explicit

### Visual PASS
- scene is not reasonably misleading
- labels attach to correct components
- hierarchy/occlusion make sense
- motion improves understanding

### Runtime PASS
- interactions work
- states are stable
- reset/play/pause behave correctly
- responsive/mobile behavior works

## Red-team checklist
Actively search for:
- reversed direction
- wrong connection
- misleading color
- impossible geometry
- misleading viewpoint
- contradictory states
- false causal explanation
- unsupported labels
- incorrect timing
- schematic path presented as literal geometry
- visual effect implying wrong science

## Stop rule
If a critical technical fact cannot be verified: **DO NOT GUESS**.

Return UNKNOWN / LIMITED CONFIDENCE and redesign the explanation around what is known.

## Platform scope
This protocol applies to every domain:
- engines
- machinery
- electrical systems
- biology
- medicine
- technical training
- troubleshooting

It is a platform rule, not a demo-specific rule.
