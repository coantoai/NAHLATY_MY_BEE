"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

const clamp = (n, min, max) => Math.min(max, Math.max(min, Number(n) || 0));

function normalizedAnchors(value) {
  const source = Array.isArray(value) ? value : [];
  return source.slice(0, 4).map((item, index) => ({
    id: String(item?.id || "anchor-" + (index + 1)),
    label: String(item?.label || item?.role || "عنصر"),
    role: String(item?.role || "part"),
    x: clamp(item?.x, 5, 95),
    y: clamp(item?.y, 7, 93)
  }));
}

function flowPath(a, b) {
  if (!a || !b) return "";
  const midX = (a.x + b.x) / 2;
  const lift = Math.max(7, Math.min(16, Math.abs(b.x - a.x) * 0.16));
  const controlY = Math.max(8, Math.min(a.y, b.y) - lift);
  return `M ${a.x} ${a.y} Q ${midX} ${controlY} ${b.x} ${b.y}`;
}

export default function InteractionRuntime({ image, alt, plan, anchors: rawAnchors }) {
  const anchors = useMemo(() => normalizedAnchors(rawAnchors), [rawAnchors]);
  const [activeId, setActiveId] = useState("");
  const [run, setRun] = useState(0);

  const recipeId = String(plan?.recipeId || "inspect");
  const supportsFlow = ["flow", "transfer", "cause-effect"].includes(recipeId) && anchors.length >= 2;
  const active = anchors.find(anchor => anchor.id === activeId) || null;
  const source = anchors[0];
  const destination = anchors[anchors.length - 1];
  const path = supportsFlow ? flowPath(source, destination) : "";

  function reset() {
    setActiveId("");
    setRun(value => value + 1);
  }

  function replay() {
    setRun(value => value + 1);
  }

  return <div className={styles.interactiveScene} data-recipe={recipeId}>
    <img
      className={active ? styles.sceneImageFocused : styles.sceneImage}
      style={active ? { transformOrigin: `${active.x}% ${active.y}%` } : undefined}
      src={image}
      alt={alt}
    />

    <div className={styles.interactionLayer}>
      {supportsFlow && <svg
        key={"flow-" + run}
        className={styles.semanticFlow}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.flowBase} d={path}/>
        <path className={styles.flowEnergy} d={path}/>
      </svg>}

      {anchors.map((anchor, index) => <button
        key={anchor.id}
        type="button"
        className={activeId === anchor.id ? styles.semanticAnchorActive : styles.semanticAnchor}
        style={{ left: anchor.x + "%", top: anchor.y + "%" }}
        aria-label={"استكشف " + anchor.label}
        onClick={() => setActiveId(activeId === anchor.id ? "" : anchor.id)}
      >
        <span>{index + 1}</span>
        <b>{anchor.label}</b>
      </button>)}

      {active && <div
        className={styles.focusCaption}
        style={{ left: clamp(active.x, 18, 82) + "%", top: clamp(active.y + 10, 16, 84) + "%" }}
      >
        <b>{active.label}</b>
        <small>اضغط مرة ثانية للرجوع</small>
      </div>}

      <div className={styles.sceneControls}>
        <button type="button" onClick={replay}>↻ أعد الحركة</button>
        <button type="button" onClick={reset}>إعادة المشهد</button>
      </div>
    </div>
  </div>;
}
