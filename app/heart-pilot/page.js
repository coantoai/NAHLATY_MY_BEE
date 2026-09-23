"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import styles from "./page.module.css";

const STAGES = {
  whole: {
    label: "القلب كاملًا",
    note: "نختبر الدوران والـZoom والإحساس بالحجم.",
    camera: [4.2, 2.6, 5.8],
    target: [0, 0, 0],
    clip: -3.2,
    opacity: 1
  },
  cutaway: {
    label: "Cutaway",
    note: "نفتح المشهد بدل وضع حركة وهمية فوق صورة مسطحة.",
    camera: [3.0, 1.5, 4.2],
    target: [0, 0, 0],
    clip: -0.15,
    opacity: 1
  },
  enter: {
    label: "الدخول",
    note: "نختبر انتقال الكاميرا إلى الداخل. التفاصيل الداخلية الدقيقة ستأتي من Asset مقسّم لاحقًا.",
    camera: [0.35, 0.1, 0.65],
    target: [0, 0, -0.45],
    clip: 0.2,
    opacity: 0.92
  },
  xray: {
    label: "شفافية",
    note: "نختبر كشف الطبقات والعلاقات قبل ربط الأجزاء الدلالية الحقيقية.",
    camera: [2.5, 1.2, 3.6],
    target: [0, 0, 0],
    clip: -3.2,
    opacity: 0.28
  }
};

export default function HeartPilotPage() {
  const mountRef = useRef(null);
  const runtimeRef = useRef(null);
  const [stage, setStage] = useState("whole");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050908);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.03, 80);
    camera.position.set(...STAGES.whole.camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.localClippingEnabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 0.25;
    controls.maxDistance = 11;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xdce7e2, 0x120908, 2.3));

    const key = new THREE.DirectionalLight(0xffffff, 4.5);
    key.position.set(4, 6, 5);
    scene.add(key);

    const warm = new THREE.PointLight(0xe55b48, 15, 12, 2);
    warm.position.set(-3, 1.2, 2.8);
    scene.add(warm);

    const rim = new THREE.PointLight(0x8bb8c9, 10, 10, 2);
    rim.position.set(3, -1.5, -3);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6, 96),
      new THREE.MeshStandardMaterial({ color: 0x0b1110, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    scene.add(floor);

    const clippingPlane = new THREE.Plane(new THREE.Vector3(0.4, 0, 1).normalize(), 3.2);
    let heart = null;
    let desired = STAGES.whole;
    let desiredClip = desired.clip;
    let desiredOpacity = desired.opacity;
    const desiredCamera = new THREE.Vector3(...desired.camera);
    const desiredTarget = new THREE.Vector3(...desired.target);

    const loader = new GLTFLoader();
    loader.load(
      "/assets/heart/ijiri-heart-v4.glb",
      (gltf) => {
        heart = gltf.scene;
        heart.rotation.set(-0.05, -0.55, -0.08);

        heart.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.geometry.computeVertexNormals();
          obj.material = new THREE.MeshPhysicalMaterial({
            color: 0xb9473e,
            roughness: 0.45,
            metalness: 0.02,
            clearcoat: 0.22,
            clearcoatRoughness: 0.55,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
            clippingPlanes: [clippingPlane],
            clipShadows: true
          });
        });

        scene.add(heart);
        setStatus("ready");
      },
      undefined,
      () => setStatus("error")
    );

    function resize() {
      const width = mount.clientWidth;
      const height = Math.max(440, Math.min(820, Math.round(width * 0.72)));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0;
    let last = performance.now();

    function animate(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt));
      controls.target.lerp(desiredTarget, 1 - Math.pow(0.001, dt));
      clippingPlane.constant += (desiredClip - clippingPlane.constant) * Math.min(1, dt * 4.8);

      if (heart) {
        heart.traverse((obj) => {
          if (obj.isMesh && obj.material) {
            obj.material.opacity += (desiredOpacity - obj.material.opacity) * Math.min(1, dt * 4.5);
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    runtimeRef.current = {
      setStage(next) {
        desired = STAGES[next];
        desiredClip = desired.clip;
        desiredOpacity = desired.opacity;
        desiredCamera.set(...desired.camera);
        desiredTarget.set(...desired.target);
        controls.enabled = next !== "enter";
      },
      reset() {
        desired = STAGES.whole;
        desiredClip = desired.clip;
        desiredOpacity = desired.opacity;
        desiredCamera.set(...desired.camera);
        desiredTarget.set(...desired.target);
        controls.enabled = true;
      },
      saveSnapshot() {
        renderer.render(scene, camera);
        renderer.domElement.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], "smart-heart-pilot.png", { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: "Smart Heart Pilot", files: [file] });
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }, "image/png");
      }
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        obj.geometry?.dispose?.();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((material) => material.dispose?.());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  }, []);

  function choose(next) {
    setStage(next);
    runtimeRef.current?.setStage(next);
  }

  return (
    <main className={styles.page}>
      <section className={styles.top}>
        <div>
          <span className={styles.eyebrow}>SMART ASSET PILOT 01</span>
          <h1>القلب — اختبار الدخول الحقيقي</h1>
          <p>
            هذا ليس القلب النهائي. هدف هذا الـPilot أن نختبر طريقة العمل:
            دوران، اقتراب، Cutaway، دخول، شفافية، وحفظ النتيجة على الهاتف.
          </p>
        </div>
        <div className={styles.badge}>Public Domain base</div>
      </section>

      <section className={styles.stageCard}>
        <div className={styles.viewer} ref={mountRef}>
          {status === "loading" && <div className={styles.state}>جارٍ تحميل القلب…</div>}
          {status === "error" && (
            <div className={styles.state}>
              ملف القلب لم يصل بعد إلى الـPreview. انتظر اكتمال بناء الـAsset ثم أعد فتح الصفحة.
            </div>
          )}
          <div className={styles.depth}>
            <span>المستوى</span>
            <b>{STAGES[stage].label}</b>
          </div>
        </div>

        <div className={styles.controls}>
          <button className={stage === "whole" ? styles.active : ""} onClick={() => choose("whole")}>
            الخارج
          </button>
          <button className={stage === "cutaway" ? styles.active : ""} onClick={() => choose("cutaway")}>
            افتح القلب
          </button>
          <button className={stage === "enter" ? styles.active : ""} onClick={() => choose("enter")}>
            ادخل
          </button>
          <button className={stage === "xray" ? styles.active : ""} onClick={() => choose("xray")}>
            شفافية
          </button>
          <button onClick={() => { setStage("whole"); runtimeRef.current?.reset(); }}>
            إعادة
          </button>
          <button onClick={() => runtimeRef.current?.saveSnapshot()}>
            حفظ لقطة
          </button>
        </div>
      </section>

      <section className={styles.explanation}>
        <div>
          <span>ماذا نختبر الآن؟</span>
          <b>{STAGES[stage].note}</b>
        </div>
        <div>
          <span>ما الذي لن نوهم به؟</span>
          <b>
            هذا الـAsset Mesh واحد. لذلك لن نسميه صمامات أو حجرات مستقلة قبل أن تكون موجودة فعليًا كأجزاء قابلة للتحديد.
          </b>
        </div>
        <div>
          <span>معيار النجاح</span>
          <b>
            إذا أحببنا تجربة الدخول والـCutaway على الهاتف، نثبت لغة التفاعل ثم نبحث عن أو نبني Master Assets أغنى بنفس الطريقة.
          </b>
        </div>
      </section>
    </main>
  );
}
