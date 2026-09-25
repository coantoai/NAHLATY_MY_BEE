"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import styles from "./page.module.css";

const CAMERA = Object.freeze({
  flow: { position: [0.2, 0.55, 18.6], target: [0, -0.2, 0] },
  valve: { position: [0.05, 0.15, 8.4], target: [0, 0.05, 1.7] },
  consequence: { position: [-1.4, 2.3, 12.6], target: [-1.05, 2.05, 0.7] }
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (current, target, amount) => current + (target - current) * amount;

function makeBloodCellGeometry() {
  const geometry = new THREE.SphereGeometry(0.16, 18, 10);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const radial = clamp(Math.hypot(x, y) / 0.16, 0, 1);
    const dimple = 0.28 + 0.72 * Math.pow(radial, 1.65);
    positions.setXYZ(i, x, y, z * 0.38 * dimple);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function tube(curve, radius, material) {
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 14, false), material);
}

function makeLeaflet(side, material) {
  const geometry = new THREE.SphereGeometry(0.7, 28, 18, 0, Math.PI * 2, 0, Math.PI);
  const leaflet = new THREE.Mesh(geometry, material);
  leaflet.scale.set(0.78, 0.92, 0.12);
  leaflet.position.set(side * 0.44, 0.04, 1.92);
  leaflet.rotation.z = side * 0.22;
  leaflet.userData.side = side;
  return leaflet;
}

export default function HeartWorld({ world, onSelectValve, onPhase }) {
  const hostRef = useRef(null);
  const worldRef = useRef(world);
  const selectRef = useRef(onSelectValve);
  const phaseRef = useRef(onPhase);
  const [status, setStatus] = useState("loading");

  useEffect(() => { worldRef.current = world; }, [world]);
  useEffect(() => { selectRef.current = onSelectValve; }, [onSelectValve]);
  useEffect(() => { phaseRef.current = onPhase; }, [onPhase]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false
      });
    } catch {
      setStatus("error");
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.13;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b12, 0.013);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.06, 90);
    camera.position.fromArray(CAMERA.flow.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.minDistance = 6.8;
    controls.maxDistance = 25;
    controls.minPolarAngle = Math.PI * 0.17;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.fromArray(CAMERA.flow.target);

    scene.add(new THREE.HemisphereLight(0xffe7dc, 0x111a2c, 2.5));
    const key = new THREE.DirectionalLight(0xffc6b0, 4.3);
    key.position.set(-6.5, 8.5, 10.5);
    scene.add(key);
    const coolRim = new THREE.PointLight(0x6f9fcf, 54, 30, 2);
    coolRim.position.set(7.5, 2, -4);
    scene.add(coolRim);
    const warmRim = new THREE.PointLight(0xe65a58, 38, 25, 2);
    warmRim.position.set(-6, -3, 7);
    scene.add(warmRim);

    const worldGroup = new THREE.Group();
    worldGroup.rotation.set(-0.06, -0.1, -0.02);
    scene.add(worldGroup);

    const fallbackMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x7f2634,
      roughness: 0.52,
      clearcoat: 0.28,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const fallbackShell = new THREE.Group();
    const lobeA = new THREE.Mesh(new THREE.SphereGeometry(3.2, 36, 24), fallbackMaterial);
    lobeA.position.set(-1.35, 1.25, -1.2);
    lobeA.scale.set(1, 1.1, 0.75);
    const lobeB = lobeA.clone();
    lobeB.material = fallbackMaterial.clone();
    lobeB.position.x = 1.35;
    const apex = new THREE.Mesh(new THREE.ConeGeometry(3.65, 6.5, 40), fallbackMaterial.clone());
    apex.position.set(0, -2.55, -1.15);
    apex.rotation.z = Math.PI;
    fallbackShell.add(lobeA, lobeB, apex);
    worldGroup.add(fallbackShell);

    let anatomicalShell = null;
    let shellMaterials = [];
    let destroyed = false;
    const loader = new GLTFLoader();
    loader.load(
      "/assets/heart/ijiri-heart-v4.glb",
      gltf => {
        if (destroyed) return;
        anatomicalShell = gltf.scene;
        anatomicalShell.name = "Public domain anatomical heart shell";
        const box = new THREE.Box3().setFromObject(anatomicalShell);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        anatomicalShell.position.sub(center);
        const maxExtent = Math.max(size.x, size.y, size.z) || 1;
        anatomicalShell.scale.setScalar(10.2 / maxExtent);
        anatomicalShell.rotation.set(-0.05, -0.55, -0.08);
        anatomicalShell.position.set(0.2, -0.15, -1.4);
        anatomicalShell.traverse(object => {
          if (!object.isMesh) return;
          object.geometry?.computeVertexNormals?.();
          const material = new THREE.MeshPhysicalMaterial({
            color: 0x7f2638,
            roughness: 0.5,
            metalness: 0,
            clearcoat: 0.34,
            clearcoatRoughness: 0.5,
            sheen: 0.2,
            sheenColor: new THREE.Color(0xd96966),
            emissive: new THREE.Color(0x240508),
            emissiveIntensity: 0.24,
            transparent: true,
            opacity: 0.44,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          object.material = material;
          shellMaterials.push(material);
        });
        worldGroup.add(anatomicalShell);
        fallbackShell.visible = false;
        setStatus("ready");
      },
      undefined,
      () => setStatus("fallback")
    );

    const semantic = new THREE.Group();
    semantic.position.set(0.2, -0.15, 0.05);
    worldGroup.add(semantic);

    const chamberMaterial = (color, opacity = 0.33) => new THREE.MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.08,
      roughness: 0.36,
      metalness: 0,
      transmission: 0.03,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 0.25
    });
    const atrium = new THREE.Mesh(new THREE.SphereGeometry(1.72, 40, 28), chamberMaterial(0xb84a5b, 0.36));
    atrium.scale.set(1.08, 0.88, 0.72);
    atrium.position.set(-0.2, 2.25, 0.1);
    semantic.add(atrium);

    const ventricle = new THREE.Mesh(new THREE.SphereGeometry(2.15, 42, 30), chamberMaterial(0xa92c43, 0.34));
    ventricle.scale.set(1.03, 1.24, 0.8);
    ventricle.position.set(0.02, -2.15, -0.02);
    semantic.add(ventricle);

    const vesselMaterial = color => new THREE.MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.09,
      roughness: 0.32,
      clearcoat: 0.42,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide
    });

    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.0, 4.1, 0),
      new THREE.Vector3(-3.2, 3.7, 0.2),
      new THREE.Vector3(-1.5, 2.9, 0.3),
      new THREE.Vector3(-0.5, 2.35, 0.4)
    ]);
    const pulmonaryTube = tube(pulmonaryCurve, 0.31, vesselMaterial(0xb85863));
    semantic.add(pulmonaryTube);

    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.28, -2.65, 0.2),
      new THREE.Vector3(1.75, -3.0, 0.3),
      new THREE.Vector3(3.1, -1.1, 0.1),
      new THREE.Vector3(3.25, 1.4, -0.15),
      new THREE.Vector3(3.0, 4.35, -0.25)
    ]);
    const aortaTube = tube(aortaCurve, 0.38, vesselMaterial(0xa83446));
    semantic.add(aortaTube);

    const inflowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.9, 4.15, 1.2),
      new THREE.Vector3(-2.5, 3.5, 1.35),
      new THREE.Vector3(-0.25, 2.15, 1.55),
      new THREE.Vector3(0, 0.25, 1.72),
      new THREE.Vector3(0.05, -1.35, 1.58),
      new THREE.Vector3(0.08, -2.65, 1.36)
    ]);
    const outflowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, -2.55, 1.38),
      new THREE.Vector3(1.45, -2.9, 1.25),
      new THREE.Vector3(2.9, -1.05, 1.05),
      new THREE.Vector3(3.25, 1.25, 0.92),
      new THREE.Vector3(3.02, 4.22, 0.75)
    ]);
    const regurgitationCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, -2.45, 1.62),
      new THREE.Vector3(0.15, -0.85, 1.82),
      new THREE.Vector3(0.04, 0.2, 1.9),
      new THREE.Vector3(-0.12, 1.25, 1.85),
      new THREE.Vector3(-0.28, 2.5, 1.7)
    ]);
    const pressureCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.4, 2.45, 1.3),
      new THREE.Vector3(-1.75, 3.1, 1.2),
      new THREE.Vector3(-3.15, 3.7, 1.15),
      new THREE.Vector3(-4.65, 4.05, 1.05)
    ]);

    const valveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe9a895,
      emissive: 0x4f1518,
      emissiveIntensity: 0.14,
      roughness: 0.38,
      clearcoat: 0.38,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide
    });
    const leftLeaflet = makeLeaflet(-1, valveMaterial.clone());
    const rightLeaflet = makeLeaflet(1, valveMaterial.clone());
    semantic.add(leftLeaflet, rightLeaflet);

    const valveHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3b79b,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    const valveHalo = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.055, 10, 64), valveHaloMaterial);
    valveHalo.position.set(0, 0.02, 1.82);
    semantic.add(valveHalo);

    const aorticValve = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.06, 10, 42),
      new THREE.MeshPhysicalMaterial({
        color: 0xd99c8d,
        roughness: 0.42,
        transparent: true,
        opacity: 0.86
      })
    );
    aorticValve.position.set(1.48, -2.65, 1.05);
    aorticValve.rotation.x = 0.2;
    semantic.add(aorticValve);

    const valveHit = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 18, 12),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.001,
        depthWrite: false
      })
    );
    valveHit.position.set(0, 0.05, 1.76);
    semantic.add(valveHit);

    const bloodGeometry = makeBloodCellGeometry();
    const makeCells = (curve, count, color) => Array.from({ length: count }, (_, index) => {
      const cell = new THREE.Mesh(
        bloodGeometry,
        new THREE.MeshPhysicalMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.16,
          roughness: 0.25,
          clearcoat: 0.34,
          transparent: true,
          opacity: 0.94,
          depthWrite: false
        })
      );
      cell.userData.offset = index / count;
      semantic.add(cell);
      return cell;
    });
    const inbound = makeCells(inflowCurve, 16, 0xf07878);
    const outbound = makeCells(outflowCurve, 14, 0xe85d60);
    const backflow = makeCells(regurgitationCurve, 11, 0xffb15f);
    const pressureCells = makeCells(pressureCurve, 8, 0xffcf79);

    const atrialGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2.25, 26, 18),
      new THREE.MeshBasicMaterial({
        color: 0xff9e65,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.BackSide
      })
    );
    atrialGlow.position.copy(atrium.position);
    atrialGlow.scale.set(1.1, 0.83, 0.78);
    semantic.add(atrialGlow);

    const dustCount = 170;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 32;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xd7a49b,
        size: 0.035,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      })
    );
    scene.add(dust);

    const resize = () => {
      const width = Math.max(280, host.clientWidth);
      const height = Math.max(360, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);
    window.addEventListener("resize", resize);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const pointerDown = event => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = event => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObject(valveHit, false).length) selectRef.current?.();
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    const clock = new THREE.Clock();
    let simTime = 0;
    let frame = 0;
    let lastPhase = "";
    let lastView = "";
    let guidedTransitionUntil = 0;
    const desiredCamera = new THREE.Vector3(...CAMERA.flow.position);
    const desiredTarget = new THREE.Vector3(...CAMERA.flow.target);

    controls.addEventListener("start", () => {
      guidedTransitionUntil = 0;
    });

    const updateCellGroup = (items, curve, visible, progress, opacity = 0.94) => {
      items.forEach(cell => {
        cell.visible = visible;
        if (!visible) return;
        const u = (progress + cell.userData.offset) % 1;
        cell.position.copy(curve.getPoint(u));
        const tangent = curve.getTangent(u).normalize();
        cell.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        cell.material.opacity = opacity;
      });
    };

    const animate = now => {
      frame = requestAnimationFrame(animate);
      if (document.hidden) return;

      const delta = Math.min(0.055, clock.getDelta());
      const state = worldRef.current;
      if (state.playing && !reducedMotion) simTime += delta * state.pace;

      const cycle = (simTime % 5.4) / 5.4;
      const filling = cycle < 0.55;
      const phase = filling ? "الامتلاء · الصمام التاجي مفتوح" : "الانقباض · الصمام التاجي مغلق";
      if (phase !== lastPhase) {
        lastPhase = phase;
        phaseRef.current?.(phase);
      }

      const systoleProgress = clamp((cycle - 0.55) / 0.45, 0, 1);
      const fillingProgress = clamp(cycle / 0.55, 0, 1);
      const leakGap = state.leaky && !filling ? 0.2 : 0;
      const valveOpening = filling ? 0.54 : leakGap;
      for (const leaflet of [leftLeaflet, rightLeaflet]) {
        const side = leaflet.userData.side;
        const targetX = side * (0.44 + valveOpening * 0.45);
        leaflet.position.x = ease(leaflet.position.x, targetX, 0.14);
        leaflet.rotation.y = ease(leaflet.rotation.y, side * valveOpening * 0.55, 0.14);
        leaflet.rotation.z = ease(leaflet.rotation.z, side * (0.1 + valveOpening * 0.24), 0.14);
      }

      const beat = state.playing && !reducedMotion
        ? Math.exp(-Math.pow(((simTime * 0.92) % 1) - 0.17, 2) / 0.006) * 0.025
        : 0;
      semantic.scale.set(1 - beat, 1 - beat * 0.72, 1 - beat);
      worldGroup.rotation.y = -0.1 + Math.sin(simTime * 0.18) * 0.018;

      updateCellGroup(inbound, inflowCurve, filling, fillingProgress, 0.92);
      updateCellGroup(outbound, outflowCurve, !filling, systoleProgress, 0.94);
      updateCellGroup(backflow, regurgitationCurve, state.leaky && !filling, systoleProgress, 0.98);
      updateCellGroup(
        pressureCells,
        pressureCurve,
        state.leaky && state.view === "consequence" && !filling,
        systoleProgress,
        0.72
      );

      const shellOpacity = state.view === "valve" ? 0.12 : state.view === "consequence" ? 0.19 : 0.38;
      shellMaterials.forEach(material => {
        material.opacity = ease(material.opacity, shellOpacity, 0.06);
        material.emissiveIntensity = ease(material.emissiveIntensity, state.view === "flow" ? 0.26 : 0.16, 0.05);
      });
      fallbackShell.children.forEach(mesh => {
        if (mesh.material) mesh.material.opacity = ease(mesh.material.opacity, shellOpacity * 0.72, 0.06);
      });

      const valveFocus = state.view === "valve";
      valveHalo.material.opacity = ease(valveHalo.material.opacity, valveFocus ? 0.52 : 0.11, 0.08);
      valveHalo.scale.setScalar(valveFocus ? 1 + Math.sin(simTime * 2.2) * 0.035 : 1);
      leftLeaflet.material.emissiveIntensity = ease(leftLeaflet.material.emissiveIntensity, valveFocus ? 0.36 : 0.13, 0.08);
      rightLeaflet.material.emissiveIntensity = ease(rightLeaflet.material.emissiveIntensity, valveFocus ? 0.36 : 0.13, 0.08);

      const consequence = state.view === "consequence" && state.leaky;
      atrialGlow.material.opacity = ease(atrialGlow.material.opacity, consequence ? 0.16 + Math.sin(simTime * 2.4) * 0.035 : 0, 0.08);
      atrium.material.emissiveIntensity = ease(atrium.material.emissiveIntensity, consequence ? 0.23 : 0.08, 0.06);
      pulmonaryTube.material.emissiveIntensity = ease(pulmonaryTube.material.emissiveIntensity, consequence ? 0.24 : 0.09, 0.06);

      if (state.view !== lastView) {
        lastView = state.view;
        const next = CAMERA[state.view] || CAMERA.flow;
        desiredCamera.fromArray(next.position);
        desiredTarget.fromArray(next.target);
        guidedTransitionUntil = now + 2100;
      }
      if (now < guidedTransitionUntil && !reducedMotion) {
        camera.position.lerp(desiredCamera, 0.052);
        controls.target.lerp(desiredTarget, 0.065);
      }

      dust.rotation.y += delta * 0.006;
      controls.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      controls.dispose();

      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        list.forEach(material => {
          materials.add(material);
          if (material.map) textures.add(material.map);
        });
      });
      geometries.forEach(geometry => geometry.dispose?.());
      materials.forEach(material => material.dispose?.());
      textures.forEach(texture => texture.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const view = world?.view || "flow";
  const focusClass = styles["sceneFocus_" + view] || "";
  return (
    <div ref={hostRef} className={styles.world} aria-label="مشهد تفاعلي ثلاثي الأبعاد للقلب الأيسر وحركة الدم والصمام التاجي">
      <div className={styles.worldVignette} aria-hidden="true"/>
      <div className={styles.sceneFocusTag + " " + focusClass} aria-hidden="true">
        <span>{view === "valve" ? "الصمام التاجي" : view === "consequence" ? "الأذين الأيسر" : "القلب الأيسر"}</span>
        <i/>
      </div>
      {status === "loading" && <div className={styles.modelStatus}>جارٍ تحميل النموذج التشريحي…</div>}
      {status === "fallback" && <div className={styles.modelStatus}>الوضع الخفيف · المحرك التفاعلي يعمل</div>}
      {status === "error" && <div className={styles.canvasError}>تعذّر تشغيل WebGL على هذه الشاشة. الأسئلة والشرح سيبقيان متاحين.</div>}
    </div>
  );
}
