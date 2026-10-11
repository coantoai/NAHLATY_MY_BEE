const MODES = new Set(["solid", "transparent", "cutaway", "exploded", "inside"]);

function direction(index, total) {
  const angle = total <= 1 ? 0 : (index / total) * Math.PI * 2;
  return [Math.cos(angle), Math.sin(angle) * 0.55, Math.sin(angle)];
}

export function planMechanicalView(sceneSpec, mode, options = {}) {
  const selectedMode = String(mode || "solid").toLowerCase();
  if (!MODES.has(selectedMode)) throw new Error(`Unsupported mechanical view mode: ${selectedMode}`);

  const parts = sceneSpec?.asset?.parts || [];
  if (!parts.length) throw new Error("SceneSpec has no semantic parts");

  const selectedPartId = String(options.selectedPartId || "");
  const cutAxis = Array.isArray(options.cutAxis) && options.cutAxis.length === 3
    ? options.cutAxis.map(Number)
    : [1, 0, 0];
  const cutOffset = Number.isFinite(Number(options.cutOffset)) ? Number(options.cutOffset) : 0;
  const explodeDistance = Number.isFinite(Number(options.explodeDistance))
    ? Math.max(0, Number(options.explodeDistance))
    : 1;

  const directives = parts.map((part, index) => {
    const base = {
      id: part.id,
      visible: true,
      opacity: 1,
      translation: [0, 0, 0],
      clipping: null,
      focus: selectedPartId ? part.id === selectedPartId : false
    };

    if (selectedMode === "transparent") {
      base.opacity = base.focus ? 1 : 0.24;
    } else if (selectedMode === "cutaway") {
      base.clipping = { normal: cutAxis, constant: cutOffset };
    } else if (selectedMode === "exploded") {
      const d = direction(index, parts.length);
      base.translation = d.map((v) => Number((v * explodeDistance).toFixed(6)));
    } else if (selectedMode === "inside") {
      base.opacity = base.focus ? 0.12 : 0.32;
      base.clipping = { normal: cutAxis, constant: cutOffset };
    }

    return base;
  });

  return {
    version: "nahlaty-mechanical-view/v1",
    mode: selectedMode,
    selectedPartId,
    directives,
    camera: selectedMode === "inside"
      ? { mode: "inside", targetPartId: selectedPartId || parts[0].id }
      : selectedMode === "exploded"
        ? { mode: "overview", fitAll: true }
        : { mode: "focus", targetPartId: selectedPartId || "" }
  };
}
