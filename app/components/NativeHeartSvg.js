"use client";

import { useEffect, useMemo, useRef } from "react";
import { validateProviderSvg, scopeInlineSvgStyles } from "../lib/recraftVector";
import styles from "./NativeHeartSvg.module.css";

// This is a view of DynamicScene state. The existing graph buttons remain the
// owners of selection and all learning-mode behavior.
export default function NativeHeartSvg({ asset, nodes, selectedNode, focusIds, visibleIds, nodeActions, getPos, playing, speed, stageRef, onPause }) {
  const hostRef = useRef(null);
  const partsRef = useRef([]);
  const bindings = useMemo(() => Array.isArray(asset.bindings) ? asset.bindings : [], [asset.bindings]);
  const markup = useMemo(() => {
    try { return { __html: scopeInlineSvgStyles(validateProviderSvg(asset.svg).svg,"."+styles.layer) }; }
    catch { return { __html: "" }; }
  }, [asset.svg]);

  useEffect(() => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const byId = new Map([...svg.querySelectorAll("[id]")].map(element => [element.id, element]));
    partsRef.current = bindings.flatMap(binding => {
      const ids = Array.isArray(binding.elementIds) ? binding.elementIds : [binding.elementId];
      return ids.map(id => byId.get(id)).filter(Boolean).map(element => ({
        element,
        conceptId: binding.conceptId,
        transform: element.getAttribute("transform") || "",
        display: element.style.display,
        opacity: element.style.opacity,
      }));
    });
    for (const { element, conceptId } of partsRef.current) {
      element.setAttribute("data-native-node-id", conceptId);
      element.setAttribute("data-concept-id", conceptId);
      element.setAttribute("tabindex", "0");
      element.setAttribute("role", "button");
    }
    for (const button of stageRef.current?.querySelectorAll("button.graphNode[data-node-id]") || []) {
      if (bindings.some(binding => binding.conceptId === button.dataset.nodeId)) {
        button.setAttribute("data-concept-id", button.dataset.nodeId);
      }
    }
    return () => { partsRef.current = []; };
  }, [asset.svg, bindings, stageRef]);

  useEffect(() => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const stageBounds = stageRef.current?.getBoundingClientRect();
    for (const part of partsRef.current) {
      const node = byId.get(part.conceptId);
      if (!node) continue;
      const visible = visibleIds.includes(node.id);
      const position = getPos(node);
      // Runtime positions use the stage rectangle. Convert that screen-space
      // delta through the SVG parent matrix, preserving aspect-ratio gutters
      // and any original ancestor transforms. Only its linear terms apply to
      // a delta; the matrix translation must not move an unchanged part.
      const screenMatrix = part.element.parentElement?.getScreenCTM?.() || svg.getScreenCTM();
      const inverse = screenMatrix?.inverse();
      const deltaX = (position.x - Number(node.x || 50)) * (stageBounds?.width || 0) / 100;
      const deltaY = (position.y - Number(node.y || 50)) * (stageBounds?.height || 0) / 100;
      const dx = inverse ? inverse.a * deltaX + inverse.c * deltaY : 0;
      const dy = inverse ? inverse.b * deltaX + inverse.d * deltaY : 0;
      part.element.setAttribute("transform", `translate(${dx} ${dy}) ${part.transform}`.trim());
      part.element.style.display = visible ? part.display : "none";
      part.element.style.opacity = part.opacity;
      part.element.setAttribute("aria-hidden", String(!visible));
      part.element.setAttribute("aria-label", node.label || node.id);
      part.element.setAttribute("aria-pressed", String(selectedNode === node.id));
      part.element.setAttribute("tabindex", visible ? "0" : "-1");
      part.element.setAttribute("data-native-state", selectedNode === node.id ? "selected" : focusIds.includes(node.id) ? "focused" : "idle");
      part.element.setAttribute("data-node-action", nodeActions.get(node.id) || (focusIds.includes(node.id) ? "activate" : "dim"));
    }
    if (playing) svg.unpauseAnimations?.();
    else svg.pauseAnimations?.();
  }, [asset.svg, bindings, nodes, selectedNode, focusIds, visibleIds, nodeActions, getPos, playing, stageRef]);

  function activate(event) {
    const part = event.target.closest?.("[data-native-node-id]");
    if (!part || !hostRef.current?.contains(part) || part.getAttribute("aria-hidden") === "true") return;
    const button = [...(stageRef.current?.querySelectorAll("button.graphNode[data-node-id]") || [])]
      .find(element => element.dataset.nodeId === part.getAttribute("data-native-node-id"));
    if (!button) return;
    onPause?.();
    button.click();
  }

  return <div
    ref={hostRef}
    className={styles.layer}
    data-playing={playing ? "true" : "false"}
    style={{ "--native-motion-speed": `${speed}s` }}
    onClick={activate}
    onKeyDown={event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate(event);
    }}
    dangerouslySetInnerHTML={markup}
  />;
}
