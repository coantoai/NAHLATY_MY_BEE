"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./page.module.css";

// An intentionally schematic, semantic left-heart world. Nothing is video or raster animation.
// Geometry, valve closure, flows and camera survive every question without remounting.
export default function HeartWorld({ world, onSelectValve, onPhase }) {
  const hostRef = useRef(null);
  const worldRef = useRef(world);
  const selectRef = useRef(onSelectValve);
  const phaseRef = useRef(onPhase);
  const [error, setError] = useState(false);

  useEffect(() => { worldRef.current = world; }, [world]);
  useEffect(() => { selectRef.current = onSelectValve; }, [onSelectValve]);
  useEffect(() => { phaseRef.current = onPhase; }, [onPhase]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setError(true);
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.17;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b12, 0.012);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 100);
    camera.position.set(0, 0.7, 21);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 7.3;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI * 0.8;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffe8d8, 0x162138, 2.1));
    const key = new THREE.DirectionalLight(0xffd4b9, 3.4);
    key.position.set(-6, 8, 10);
    scene.add(key);
    const rim = new THREE.PointLight(0x76a8cf, 68, 32);
    rim.position.set(7, 2, -5);
    scene.add(rim);
    const redLight = new THREE.PointLight(0xe74c57, 28, 22);
    redLight.position.set(-5, -4, 7);
    scene.add(redLight);

    const heart = new THREE.Group();
    heart.rotation.y = -0.12;
    scene.add(heart);
    // Keep the semantic engine, but give it a real heart silhouette.
    // The public-domain Ijiri mesh is only an exterior visual shell; all teaching
    // states, flow and valve behavior remain owned by the persistent Nahlaty world.
    const tissue = new THREE.MeshPhysicalMaterial({
      color: 0x8f2635, roughness: 0.52, metalness: 0,
      transparent: true, opacity: 0.16, depthWrite: false,
      side: THREE.DoubleSide, clearcoat: 0.32,
      emissive: new THREE.Color(0x260407), emissiveIntensity: 0.24
    });
    const shellFallback = new THREE.Mesh(new THREE.SphereGeometry(5.1, 44, 32), tissue.clone());
    shellFallback.scale.set(1, 1.2, 0.66);
    shellFallback.position.set(0, -0.5, -1.3);
    shellFallback.material.opacity = 0.045;
    heart.add(shellFallback);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load("/assets/heart/ijiri-heart-v4.glb", gltf => {
      const anatomicalShell = gltf.scene;
      const box = new THREE.Box3().setFromObject(anatomicalShell);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      anatomicalShell.position.sub(center);
      const maxExtent = Math.max(size.x, size.y, size.z) || 1;
      anatomicalShell.scale.setScalar(10.3 / maxExtent);
      anatomicalShell.rotation.set(-0.02, -0.48, -0.06);
      anatomicalShell.position.set(0.15, -0.45, -1.85);
      anatomicalShell.traverse(object => {
        if (!object.isMesh) return;
        object.geometry.computeVertexNormals();
        object.material = tissue.clone();
      });
      heart.add(anatomicalShell);
    }, undefined, () => {
      // Fallback stays visible; failure must never break the semantic experience.
      shellFallback.material.opacity = 0.095;
    });

    const chamberMaterial = color => new THREE.MeshPhysicalMaterial({
      color, emissive: color, emissiveIntensity: 0.1, roughness: 0.35,
      transparent: true, opacity: 0.41, depthWrite: false,
      side: THREE.DoubleSide, clearcoat: 0.38
    });
    const atrium = new THREE.Mesh(new THREE.SphereGeometry(1.78, 42, 30), chamberMaterial(0xdb6c70));
    atrium.scale.set(1.07, 0.84, 0.77);
    atrium.position.set(0, 2.26, -0.1);
    const ventricle = new THREE.Mesh(new THREE.SphereGeometry(2.08, 42, 30), chamberMaterial(0xc94458));
    ventricle.scale.set(1.04, 1.28, 0.88);
    ventricle.position.set(0, -2.26, -0.2);
    heart.add(atrium, ventricle);

    const point = (x, y, z = 1.1) => new THREE.Vector3(x, y, z);
    const tube = (coordinates, color, radius) => {
      const curve = new THREE.CatmullRomCurve3(coordinates.map(p => point(...p)));
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 68, radius, 12, false),
        new THREE.MeshPhysicalMaterial({
          color, roughness: 0.33, metalness: 0.04, clearcoat: 0.5,
          emissive: color, emissiveIntensity: 0.07
        })
      );
      heart.add(mesh);
      return { curve, mesh };
    };
    tube([[-5.1, 4.4, 0], [-3.2, 3.75, 0], [-1.1, 2.75, 0]], 0xbd6571, 0.38);
    const aorta = tube([[0.45, -2.55, 0], [2.25, -3.2, 0], [4.25, -0.7, 0], [4.1, 3.8, 0]], 0xc95658, 0.37);
    const inletFlow = new THREE.CatmullRomCurve3([
      point(-5, 4.4, 1.2), point(-2.6, 3.6, 1.4), point(0, 2.2, 1.4),
      point(0, 0.27, 1.5), point(0, -1.45, 1.5), point(0, -2.8, 1.5)
    ]);
    const outletFlow = new THREE.CatmullRomCurve3([
      point(0.2, -2.8, 1.5), point(1.5, -3.3, 1.5), point(3.55, -1.3, 1.4),
      point(4.1, 1.2, 1.4), point(4.1, 3.8, 1.4)
    ]);
    const leakFlow = new THREE.CatmullRomCurve3([
      point(0, -2.55, 1.78), point(0.12, -0.75, 1.86),
      point(0, 0.3, 1.88), point(-0.2, 2.4, 1.86)
    ]);

    const valveRing = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.115, 12, 58),
      new THREE.MeshPhysicalMaterial({ color: 0xf1b9a9, roughness: 0.33, metalness: 0.07, clearcoat: 0.4 })
    );
    valveRing.position.set(0, 0.18, 1.54);
    heart.add(valveRing);
    const flapMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5b7ac, roughness: 0.37, side: THREE.DoubleSide,
      transparent: true, opacity: 0.95, clearcoat: 0.3
    });
    const flapGeometry = new THREE.PlaneGeometry(0.87, 0.78);
    const leftFlap = new THREE.Mesh(flapGeometry, flapMaterial);
    const rightFlap = new THREE.Mesh(flapGeometry, flapMaterial.clone());
    leftFlap.position.set(-0.445, 0.18, 1.63);
    rightFlap.position.set(0.445, 0.18, 1.63);
    const valveHit = new THREE.Mesh(
      new THREE.CircleGeometry(1.3, 36),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false, side: THREE.DoubleSide })
    );
    valveHit.position.set(0, 0.18, 1.7);
    heart.add(leftFlap, rightFlap, valveHit);
    const aorticRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.075, 10, 40),
      new THREE.MeshPhysicalMaterial({ color: 0xe9b6a2, roughness: 0.4 })
    );
    aorticRing.position.set(1.72, -3.05, 1.18);
    heart.add(aorticRing);
    const pulmonaryCue = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 10),
      new THREE.MeshBasicMaterial({ color: 0xffc17a, transparent: true, opacity: 0.45 })
    );
    pulmonaryCue.position.set(-3.5, 3.95, 0.5);
    heart.add(pulmonaryCue);

    function addLabel(message, x, y, z) {
      const canvas = document.createElement("canvas");
      canvas.width = 540;
      canvas.height = 105;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "rgba(13, 19, 29, 0.89)";
      ctx.beginPath();
      ctx.roundRect(5, 5, 530, 95, 23);
      ctx.fill();
      ctx.strokeStyle = "rgba(248, 203, 187, 0.43)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff2e7";
      ctx.font = "600 40px system-ui, Arial";
      ctx.fillText(message, 270, 54, 510);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture, transparent: true, depthTest: false, opacity: 0.88
      }));
      sprite.scale.set(3.1, 0.6, 1);
      sprite.position.set(x, y, z);
      heart.add(sprite);
    }
    addLabel("من الرئتين", -4.45, 5.15, 2);
    addLabel("الأذين الأيسر", -2.7, 2.45, 2);
    addLabel("الصمام التاجي", -2.6, 0.33, 2);
    addLabel("البطين الأيسر", -3.0, -2.65, 2);
    addLabel("الأبهر", 4.4, 4.55, 2);

    const particleGeometry = new THREE.SphereGeometry(0.105, 10, 8);
    function particles(curve, count, color) {
      return Array.from({ length: count }, (_, i) => {
        const mesh = new THREE.Mesh(
          particleGeometry,
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92, depthWrite: false })
        );
        mesh.userData.offset = i / count;
        heart.add(mesh);
        return mesh;
      });
    }
    const inbound = particles(inletFlow, 16, 0xffa49c);
    const outbound = particles(outletFlow, 14, 0xffb6a3);
    const backflow = particles(leakFlow, 11, 0xffbb62);

    function resize() {
      const width = Math.max(260, host.clientWidth);
      const height = Math.max(360, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(host);
    window.addEventListener("resize", resize);
    resize();

    const raycaster = new THREE.Raycaster();
    const cursor = new THREE.Vector2();
    let pressed = null;
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    function onPointerDown(event) { pressed = { x: event.clientX, y: event.clientY }; }
    function onPointerUp(event) {
      if (!pressed || Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 8) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      cursor.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -((event.clientY - bounds.top) / bounds.height * 2 - 1));
      raycaster.setFromCamera(cursor, camera);
      if (raycaster.intersectObjects([valveHit, leftFlap, rightFlap]).length) selectRef.current?.();
    }

    let frame = 0, simTime = 0, lastPhase = "", lastView = "";
    let transitioningUntil = 0;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    const clock = new THREE.Clock();
    controls.addEventListener("start", () => { transitioningUntil = 0; });
    function render(now) {
      frame = requestAnimationFrame(render);
      const delta = Math.min(0.06, clock.getDelta());
      if (document.hidden) return;
      const state = worldRef.current;
      if (state.playing && !reducedMotion) simTime += delta * state.pace;
      const fraction = (simTime % 6) / 6;
      const filling = fraction < 0.53;
      const phaseName = filling ? "الامتلاء: الصمام التاجي مفتوح" : "الانقباض: الصمام التاجي يُغلق";
      if (phaseName !== lastPhase) { lastPhase = phaseName; phaseRef.current?.(phaseName); }
      const openAmount = filling ? 1 : state.leaky ? 0.27 : 0;
      const desiredGap = filling ? 0.5 : state.leaky ? 0.16 : 0;
      for (const [leaf, side] of [[leftFlap, -1], [rightFlap, 1]]) {
        const x = side * (0.445 + desiredGap);
        leaf.position.x += (x - leaf.position.x) * 0.14;
        const tilt = side * (filling ? 0.52 : state.leaky ? 0.13 : 0);
        leaf.rotation.z += (tilt - leaf.rotation.z) * 0.13;
        leaf.rotation.x += ((openAmount * 0.38) - leaf.rotation.x) * 0.13;
      }
      valveRing.material.emissive = new THREE.Color(state.view === "valve" ? 0x783022 : 0x230b11);
      valveRing.material.emissiveIntensity = state.view === "valve" ? 0.43 : 0.12;
      ventricle.scale.x = 1.04 * (filling ? 1 : 0.94);
      ventricle.scale.y = 1.28 * (filling ? 1 : 0.95);
      pulmonaryCue.material.opacity = state.view === "consequence" && state.leaky ? 0.94 : 0.35;

      const updateParticles = (items, curve, active, progress) => {
        items.forEach(mesh => {
          mesh.visible = active;
          if (!active) return;
          const u = (progress + mesh.userData.offset) % 1;
          mesh.position.copy(curve.getPoint(u));
        });
      };
      updateParticles(inbound, inletFlow, filling, fraction / 0.53);
      updateParticles(outbound, outletFlow, !filling, (fraction - 0.53) / 0.47);
      updateParticles(backflow, leakFlow, state.leaky && !filling, (fraction - 0.53) / 0.47);

      if (state.view !== lastView) {
        lastView = state.view;
        transitioningUntil = now + 1850;
      }
      if (now < transitioningUntil && !reducedMotion) {
        const cameraGoal = state.view === "valve" ? point(0, 0.35, 10.1)
          : state.view === "consequence" ? point(-1.25, 2.05, 16.1)
            : point(0, 0.65, 21);
        const focusGoal = state.view === "valve" ? point(0, 0.15, 0)
          : state.view === "consequence" ? point(-1.1, 2.1, 0)
            : point(0, 0, 0);
        camera.position.lerp(cameraGoal, 0.045);
        controls.target.lerp(focusGoal, 0.055);
      }
      controls.update();
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      const geometries = new Set(), materials = new Set(), textures = new Set();
      scene.traverse(item => {
        if (item.geometry) geometries.add(item.geometry);
        const list = Array.isArray(item.material) ? item.material : item.material ? [item.material] : [];
        list.forEach(material => {
          materials.add(material);
          if (material.map) textures.add(material.map);
        });
      });
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      textures.forEach(t => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.world} role="img" aria-label="مشهد ثلاثي الأبعاد تخطيطي للقلب الأيسر، وصمامه التاجي، وحركة الدم في الاتجاهين">
      {error && <div className={styles.canvasError}>تعذّر تشغيل 3D في هذا المتصفح. لا تزال الأسئلة والشرح متاحة أدناه.</div>}
    </div>
  );
}
