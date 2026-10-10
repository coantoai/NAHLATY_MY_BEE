import { getRecipe } from "./recipes";

const text = value => String(value || "").toLowerCase();
const includesAny = (value, terms) => terms.some(term => value.includes(term));

function chooseRecipe(understanding = {}, brief = {}) {
  const q = text(understanding.question);
  const relation = text(understanding.relation);
  const story = text(brief.visualStory || brief.coreIdea || "");
  const all = q + " " + story;

  if (includesAny(all, ["محرك", "بستم", "مكبس", "engine", "piston", "gear", "ترس"])) {
    return "mechanical-cycle";
  }
  if (includesAny(all, ["قلب", "دم", "blood", "heart", "كهرباء", "تيار", "electric", "solar", "شمس"])) {
    return "flow";
  }
  if (includesAny(all, ["نحلة", "حبوب اللقاح", "تلقيح", "bee", "pollen", "pollination"])) {
    return "transfer";
  }
  if (relation === "causality") return "cause-effect";
  if (relation === "growth") return "growth";
  if (relation === "comparison") return "comparison";
  if (relation === "transformation") return "flow";

  const devices = Array.isArray(brief.visualDevices) ? brief.visualDevices : [];
  const has3d = devices.some(device => text(device?.type) === "3d-model");
  if (has3d) return "exploded-inspection";

  return "inspect";
}

function semanticBindings(recipeId, understanding = {}, priorityMap = []) {
  const essentials = Array.isArray(understanding.essentialElements) ? understanding.essentialElements : [];
  const priorities = Array.isArray(priorityMap) ? priorityMap : [];
  const first = priorities[0]?.target || essentials[0] || "hero";
  const second = priorities[1]?.target || essentials[1] || "secondary";
  const third = priorities[2]?.target || essentials[2] || "result";

  if (recipeId === "flow") {
    return { source: essentials[0] || first, path: essentials[2] || second, destination: essentials.at(-1) || third };
  }
  if (recipeId === "transfer") {
    return { source: first, destination: third, carrier: second };
  }
  if (recipeId === "mechanical-cycle") {
    return { ignition: essentials[1] || first, "reaction-zone": essentials[2] || second, "moving-part": essentials[3] || third };
  }
  if (recipeId === "cause-effect") {
    return { cause: essentials[0] || first, bridge: essentials[1] || second, effect: essentials[2] || third };
  }
  if (recipeId === "growth") {
    return { stage: first, "next-stage": second, subject: third };
  }
  if (recipeId === "comparison") {
    return { "subject-a": essentials[0] || first, "subject-b": essentials[1] || second, criterion: essentials[2] || third };
  }
  return { hero: first, inspectable: second, part: third };
}

export function buildInteractionPlan({ understanding = {}, brief = {}, priorityMap = [] } = {}) {
  const recipeId = chooseRecipe(understanding, brief);
  const recipe = getRecipe(recipeId);
  const bindings = semanticBindings(recipeId, understanding, priorityMap);

  return {
    version: "interaction-library-v1",
    mode: "declarative",
    recipeId: recipe.id,
    intent: recipe.intent,
    bindings,
    actions: recipe.actions,
    rules: {
      regenerateAIOnInteraction: false,
      oneDominantSemanticMotion: true,
      genericPulseMarker: false,
      preferDirectManipulation: true,
      reuseActionsAcrossScenes: true
    }
  };
}
