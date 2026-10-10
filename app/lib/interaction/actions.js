export const ACTION_LIBRARY = Object.freeze({
  tap: {
    id: "tap",
    category: "trigger",
    renderer: "dom",
    cost: "local",
    description: "Select or activate a semantic target."
  },
  zoom: {
    id: "zoom",
    category: "camera",
    renderer: "css-or-3d",
    cost: "local",
    defaults: { scale: 1.8, duration: 0.6 }
  },
  focus: {
    id: "focus",
    category: "attention",
    renderer: "css-or-3d",
    cost: "local",
    defaults: { dimOthers: 0.5, duration: 0.35 }
  },
  isolate: {
    id: "isolate",
    category: "attention",
    renderer: "scene",
    cost: "local",
    defaults: { hideOthers: true, duration: 0.4 }
  },
  rotate: {
    id: "rotate",
    category: "camera",
    renderer: "3d",
    cost: "local",
    defaults: { axis: "y", degrees: 45, duration: 0.8 }
  },
  reveal: {
    id: "reveal",
    category: "visibility",
    renderer: "scene",
    cost: "local",
    defaults: { mode: "fade", duration: 0.45 }
  },
  explode: {
    id: "explode",
    category: "structure",
    renderer: "3d",
    cost: "local",
    defaults: { distance: 1, duration: 0.9 }
  },
  highlight: {
    id: "highlight",
    category: "attention",
    renderer: "svg-or-3d",
    cost: "local",
    defaults: { intensity: 1, duration: 0.3 }
  },
  flow: {
    id: "flow",
    category: "semantic-motion",
    renderer: "svg-canvas-or-3d",
    cost: "local",
    defaults: { duration: 1.8, loop: true, particleDensity: "medium" }
  },
  pulse: {
    id: "pulse",
    category: "micro-motion",
    renderer: "css-canvas-or-3d",
    cost: "local",
    defaults: { duration: 1.2, loop: true, intensity: 0.12 }
  },
  drag: {
    id: "drag",
    category: "direct-manipulation",
    renderer: "dom-or-3d",
    cost: "local",
    defaults: { axis: "free" }
  },
  step: {
    id: "step",
    category: "sequence",
    renderer: "state",
    cost: "local",
    defaults: { step: 1 }
  },
  compare: {
    id: "compare",
    category: "comparison",
    renderer: "scene",
    cost: "local",
    defaults: { mode: "side-by-side" }
  },
  stateChange: {
    id: "state-change",
    category: "semantic-state",
    renderer: "scene",
    cost: "local",
    defaults: { duration: 0.35 }
  },
  toggleLayer: {
    id: "toggle-layer",
    category: "visibility",
    renderer: "scene",
    cost: "local",
    defaults: { visible: true }
  },
  replay: {
    id: "replay",
    category: "control",
    renderer: "timeline",
    cost: "local"
  },
  reset: {
    id: "reset",
    category: "control",
    renderer: "timeline",
    cost: "local"
  }
});

export const ACTION_IDS = Object.freeze(Object.keys(ACTION_LIBRARY));

export function getAction(id) {
  return ACTION_LIBRARY[id] || null;
}

export function makeAction(id, config = {}) {
  const definition = getAction(id);
  if (!definition) return null;
  return {
    id: definition.id,
    libraryKey: id,
    renderer: definition.renderer,
    cost: definition.cost,
    ...definition.defaults,
    ...config
  };
}
