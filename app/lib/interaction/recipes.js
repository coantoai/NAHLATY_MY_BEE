import { makeAction } from "./actions";

const build = (id, title, intent, actions) => Object.freeze({
  id,
  title,
  intent,
  actions: actions.filter(Boolean)
});

export const BEHAVIOR_RECIPES = Object.freeze({
  inspect: build(
    "inspect",
    "Inspect",
    "Let the learner choose a meaningful part, focus it, then inspect it closely.",
    [
      makeAction("tap", { targetRole: "inspectable" }),
      makeAction("focus", { targetRole: "inspectable" }),
      makeAction("zoom", { targetRole: "inspectable" }),
      makeAction("reset")
    ]
  ),
  flow: build(
    "flow",
    "Flow",
    "Show something moving from a source through a meaningful path to a destination.",
    [
      makeAction("flow", {
        sourceRole: "source",
        pathRole: "path",
        destinationRole: "destination",
        arrivalEffect: "state-change"
      }),
      makeAction("stateChange", { targetRole: "destination", state: "active" }),
      makeAction("replay"),
      makeAction("reset")
    ]
  ),
  transfer: build(
    "transfer",
    "Transfer",
    "Show material or information transferring between two semantic targets.",
    [
      makeAction("highlight", { targetRole: "source" }),
      makeAction("flow", { sourceRole: "source", destinationRole: "destination" }),
      makeAction("highlight", { targetRole: "destination" }),
      makeAction("replay")
    ]
  ),
  causeEffect: build(
    "cause-effect",
    "Cause → Effect",
    "Trigger a cause, reveal the bridge, then change the resulting state.",
    [
      makeAction("tap", { targetRole: "cause" }),
      makeAction("highlight", { targetRole: "cause" }),
      makeAction("reveal", { targetRole: "bridge" }),
      makeAction("stateChange", { targetRole: "effect", state: "result" }),
      makeAction("replay")
    ]
  ),
  mechanicalCycle: build(
    "mechanical-cycle",
    "Mechanical Cycle",
    "Run a short reusable mechanical loop with one dominant movement.",
    [
      makeAction("stateChange", { targetRole: "ignition", state: "on" }),
      makeAction("highlight", { targetRole: "reaction-zone" }),
      makeAction("flow", { sourceRole: "reaction-zone", destinationRole: "moving-part", duration: 0.7, loop: false }),
      makeAction("stateChange", { targetRole: "moving-part", state: "translated" }),
      makeAction("stateChange", { targetRole: "moving-part", state: "home" }),
      makeAction("replay")
    ]
  ),
  growth: build(
    "growth",
    "Growth",
    "Move through meaningful stages without generating a new animation for every lesson.",
    [
      makeAction("step", { targetRole: "stage", step: 1 }),
      makeAction("reveal", { targetRole: "next-stage" }),
      makeAction("stateChange", { targetRole: "subject", state: "grown" }),
      makeAction("replay"),
      makeAction("reset")
    ]
  ),
  comparison: build(
    "comparison",
    "Compare",
    "Keep two subjects visible while the learner focuses one criterion at a time.",
    [
      makeAction("compare", { leftRole: "subject-a", rightRole: "subject-b" }),
      makeAction("tap", { targetRole: "criterion" }),
      makeAction("highlight", { targetRole: "difference" }),
      makeAction("reset")
    ]
  ),
  explodedInspection: build(
    "exploded-inspection",
    "Exploded Inspection",
    "Open a complex 3D object into parts, inspect one part, then return it.",
    [
      makeAction("tap", { targetRole: "hero" }),
      makeAction("explode", { targetRole: "hero" }),
      makeAction("focus", { targetRole: "part" }),
      makeAction("rotate", { targetRole: "part" }),
      makeAction("reset")
    ]
  ),
  layeredReveal: build(
    "layered-reveal",
    "Layered Reveal",
    "Reveal internal layers on demand instead of adding explanatory boxes over the scene.",
    [
      makeAction("tap", { targetRole: "layer-control" }),
      makeAction("toggleLayer", { targetRole: "layer" }),
      makeAction("focus", { targetRole: "layer" }),
      makeAction("reset")
    ]
  )
});

export function getRecipe(id) {
  return BEHAVIOR_RECIPES[id] || BEHAVIOR_RECIPES.inspect;
}
