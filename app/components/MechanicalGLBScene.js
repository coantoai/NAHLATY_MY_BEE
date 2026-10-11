"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

function cloneMaterials(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (Array.isArray(obj.material)) obj.material = obj.material.map((m) => m.clone());
    else if (obj.material) obj.material = obj.material.clone();
  });
}

function forEachMaterial(obj, fn) {
  if (!obj?.isMesh) return;
  const list = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const material of list.filter(Boolean)) fn(material);
}

function semanticId(obj) {
  return String(
    obj?.userData?.nahlaty_semantic_id ||
    obj?.userData?.semanticId ||
    obj?.name ||
    ""
  ).trim();
}

function applyViewPlan(root, plan) {
  const directives = new Map((plan?.directives || []).map((item) => [item.id, item]));

  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const id = semanticId(obj);
    const directive = directives.get(id);
    if (!directive) return;

    obj.visible = directive.visible !== false;

    const base = obj.userData.__nahlatyBasePosition;
    if (base) {
      obj.position.set(
        base.x + Number(directive.translation?.[0] || 0),
        base.y + Number(directive.translation?.[1] || 0),
        base.z + Number(directive.translation?.[2] || 0)
      );
    }

    forEachMaterial(obj, (material) => {
      material.transparent = Number(directive.opacity) < 0.999;
      material.opacity = Number(directive.opacity ?? 1);
      material.depthWrite = Number(directive.opacity) > 0.6;

      if (directive.clipping?.normal) {
        const n = directive.clipping.normal;
        material.clippingPlanes = [
          new THREE.Plane(
            new THREE.Vector3(Number(n[0]), Number(n[1]), Number(n[2])).normalize(),
            Number(directive.clipping.constant || 0)
          )
        ];
        material.clipShadows = true;
      } else {
        material.clippingPlanes = null;
      }
      material.needsUpdate = true;
    });
  });
}

function frameObject(camera, controls, root) {
  const box = new THREE.Box3().setFromObject(root);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const radius = Math.max(0.5, sphere.radius);
  camera.position.copy(sphere.center).add(new THREE.Vector3(radius * 1.25, radius * 0.75, radius * 2.1));
  camera.near = Math.max(0.01, radius / 100);
  camera.far = Math.max(100, radius * 50);
  camera.updateProjectionMatrix();
  controls.target.copy(sphere.center);
  controls.minDistance = radius * 0.45;
  controls.maxDistance = radius * 8;
  controls.update();
}

export default function MechanicalGLBScene({
  glbUrl,
  sceneSpec,
  viewPlan,
  bloomStrength = 0.35,
  onReady,
  onSelectPart
}) {
  const hostRef = useRef(null);
  const runtimeRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !glbUrl) return;

    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070b);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.01, 5000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.localClippingEnabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    const key = new THREE.DirectionalLight(0xffddb0, 3.0);
    key.position.set(6, 8, 10);
    const fill = new THREE.DirectionalLight(0x9fc5ff, 1.7);
    fill.position.set(-7, 2, 5);
    const rim = new THREE.DirectionalLight(0xffc477, 2.0);
    rim.position.set(0, -8, 7);
    scene.add(key, fill, rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), bloomStrength, 0.6, 0.92);
    composer.addPass(bloom);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let root = null;
    let frame = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const click = (event) => {
      if (!root) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(root, true).find((x) => x.object?.isMesh);
      if (!hit) return;
      const id = semanticId(hit.object);
      if (id) onSelectPart?.(id);
    };
    renderer.domElement.addEventListener("click", click);

    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        if (disposed) return;
        root = gltf.scene;
        cloneMaterials(root);

        root.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.userData.__nahlatyBasePosition = obj.position.clone();

          forEachMaterial(obj, (material) => {
            if ("envMapIntensity" in material) material.envMapIntensity = 1.15;
          });
        });

        scene.add(root);
        frameObject(camera, controls, root);
        applyViewPlan(root, viewPlan);

        runtimeRef.current = { root, camera, controls, renderer, composer };
        onReady?.({
          parts: sceneSpec?.asset?.parts?.map((p) => p.id) || [],
          animations: gltf.animations?.length || 0
        });
      },
      undefined,
      () => {}
    );

    const animate = () => {
      if (disposed) return;
      controls.update();
      composer.render();
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.domElement.removeEventListener("click", click);
      controls.dispose();
      composer.dispose();
      pmrem.dispose();
      environment.dispose();
      renderer.dispose();
      if (root) {
        root.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.();
          forEachMaterial(obj, (material) => material.dispose?.());
        });
      }
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  }, [glbUrl]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime?.root) return;
    applyViewPlan(runtime.root, viewPlan);
  }, [viewPlan]);

  return <div ref={hostRef} style={{ width: "100%", height: "100%", minHeight: 420 }} />;
}
