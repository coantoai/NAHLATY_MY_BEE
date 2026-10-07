"use client";

import { useEffect, useMemo, useRef } from "react";
import { validateProviderSvg, scopeInlineSvgStyles } from "../lib/recraftVector";
import { syncHeartAnimations } from "../lib/heartRuntimeTiming";
import styles from "./NativeHeartSvg.module.css";

// This is a view of DynamicScene state. The existing graph buttons remain the
// owners of selection and all learning-mode behavior.
export default function NativeHeartSvg({ asset, nodes, selectedNode, focusIds, visibleIds, nodeActions, getPos, playing, speed, stageRef, onPause }) {
  const hostRef = useRef(null);
  const partsRef = useRef([]);
  const periodRef = useRef(speed);
  const panRef = useRef(null);
  const originalViewBoxRef = useRef("");
  const ignorePanClickRef = useRef(false);
  const bindings = useMemo(() => Array.isArray(asset.bindings) ? asset.bindings : [], [asset.bindings]);
  const markup = useMemo(() => {
    try { return { __html: scopeInlineSvgStyles(validateProviderSvg(asset.svg).svg,"."+styles.layer) }; }
    catch { return { __html: "" }; }
  }, [asset.svg]);

  useEffect(() => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    originalViewBoxRef.current=svg.getAttribute("viewBox")||"";
    const resetButton=[...(stageRef.current?.closest(".dynamicScene")?.querySelectorAll(".immersiveControls button")||[])]
      .find(button=>button.textContent.trim()==="إعادة المشهد");
    const resetPan=()=>{svg.setAttribute("viewBox",originalViewBoxRef.current);svg.dataset.panned="false";panRef.current=null;ignorePanClickRef.current=false;if(hostRef.current)hostRef.current.dataset.panning="false";};
    resetButton?.addEventListener("click",resetPan);
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
    return () => { partsRef.current = [];resetButton?.removeEventListener("click",resetPan); };
  }, [asset.svg, bindings, stageRef]);

  useEffect(() => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const stageBounds = stageRef.current?.getBoundingClientRect();
    let aligned = true;
    for (const part of partsRef.current) {
      const node = byId.get(part.conceptId);
      if (!node) continue;
      const visible = visibleIds.includes(node.id);
      const position = getPos(node);
      if(Math.abs(position.x-Number(node.x||50))>.01||Math.abs(position.y-Number(node.y||50))>.01)aligned=false;
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
    // A displaced inspection view is not a connected circulation model.
    // Keep the existing drag interaction, but do not assert flow across gaps.
    const blood=svg.querySelector("#blood-interior");
    if(blood){blood.style.display=aligned?"":"none";svg.dataset.flowAligned=String(aligned);}
    if (playing) svg.unpauseAnimations?.();
    else svg.pauseAnimations?.();
  }, [asset.svg, bindings, nodes, selectedNode, focusIds, visibleIds, nodeActions, getPos, playing, stageRef]);

  useEffect(()=>{
    syncHeartAnimations(hostRef.current,periodRef.current,speed,playing);
    periodRef.current=speed;
  },[asset.svg,speed,playing,visibleIds,getPos]);

  function activate(event) {
    if(ignorePanClickRef.current&&event.type!=="keydown"){ignorePanClickRef.current=false;return;}
    ignorePanClickRef.current=false;
    const part = event.target.closest?.("[data-native-node-id]");
    if (!part || !hostRef.current?.contains(part) || part.getAttribute("aria-hidden") === "true") return;
    const button = [...(stageRef.current?.querySelectorAll("button.graphNode[data-node-id]") || [])]
      .find(element => element.dataset.nodeId === part.getAttribute("data-native-node-id"));
    if (!button) return;
    onPause?.();
    button.click();
  }

  function beginPan(event){
    if(!(event.shiftKey&&event.button===0||event.button===1)){ignorePanClickRef.current=false;return;}
    const svg=hostRef.current?.querySelector("svg"),matrix=svg?.getScreenCTM()?.inverse();
    if(!svg||!matrix)return;
    const box=svg.viewBox.baseVal;
    panRef.current={svg,matrix,x:event.clientX,y:event.clientY,box:[box.x,box.y,box.width,box.height]};
    ignorePanClickRef.current=event.button===0;
    event.preventDefault();event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.panning="true";
  }

  function movePan(event){
    const pan=panRef.current;if(!pan)return;
    const x=event.clientX-pan.x,y=event.clientY-pan.y;
    const dx=pan.matrix.a*x+pan.matrix.c*y,dy=pan.matrix.b*x+pan.matrix.d*y;
    pan.svg.setAttribute("viewBox",[pan.box[0]-dx,pan.box[1]-dy,...pan.box.slice(2)].join(" "));
    pan.svg.dataset.panned="true";
    event.preventDefault();event.stopPropagation();
  }

  function endPan(event){
    if(event.type==="pointercancel"||event.type==="lostpointercapture")ignorePanClickRef.current=false;
    if(!panRef.current)return;
    panRef.current=null;event.currentTarget.dataset.panning="false";
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <div
    ref={hostRef}
    className={styles.layer}
    data-playing={playing ? "true" : "false"}
    title="Shift + drag or middle-button drag to pan; Reset scene restores the view."
    style={{ "--native-motion-speed": `${speed}s` }}
    onClick={activate}
    onPointerDown={beginPan}
    onPointerMove={movePan}
    onPointerUp={endPan}
    onPointerCancel={endPan}
    onLostPointerCapture={event=>{if(panRef.current)endPan(event)}}
    onKeyDown={event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate(event);
    }}
    dangerouslySetInnerHTML={markup}
  />;
}
