"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createCutawayRig, applyCutawayState, CUTAWAY_FLOOR_Y, CUTAWAY_HEAD_OPACITY } from '../lib/engine/cutawayRig.js';
import { createEngineClock, sampleEngineState } from '../lib/engine/zz4Model.js';
import styles from './page.module.css';

const PHASES = [
  { id: 'intake', ar: 'سحب', en: 'Intake' },
  { id: 'compression', ar: 'ضغط', en: 'Compression' },
  { id: 'power', ar: 'قدرة', en: 'Power' },
  { id: 'exhaust', ar: 'عادم', en: 'Exhaust' },
];

function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
}

export default function EngineCutaway() {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const [mode, setMode] = useState('running');
  const [renderStatus, setRenderStatus] = useState('loading');
  const [snapshot, setSnapshot] = useState(() => sampleEngineState(0));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setRenderStatus('unavailable');
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b09);
    scene.fog = new THREE.Fog(0x070b09, 8, 18);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(5.5, 3.8, 8.4);
    camera.lookAt(0, 0.7, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'مقطع تعليمي لأسطوانة واحدة: مكبس وذراع توصيل ومرفق وصمامان');
    renderer.domElement.setAttribute('role', 'img');
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xcfe2d3, 0x111713, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.PointLight(0xf4b35f, 8, 10, 2);
    rim.position.set(-3, 2.5, -2);
    scene.add(rim);
    const cool = new THREE.PointLight(0x6fb7ff, 5, 9, 2);
    cool.position.set(3, 1.2, -3);
    scene.add(cool);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(5.6, 96), new THREE.MeshStandardMaterial({ color: 0x0d1510, roughness: 0.96, metalness: 0.03 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = CUTAWAY_FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    const rig = createCutawayRig();
    rig.group.rotation.y = -0.3;
    scene.add(rig.group);
    const labels = [
      [rig.piston, 'المكبس · Piston', 0.15],
      [rig.crankGroup, 'المرفق · Crank', -0.15],
      [rig.intakeValve, 'السحب · Intake', 0.65],
      [rig.exhaustValve, 'العادم · Exhaust', 0.35],
    ].map(([object, text, offset]) => {
      const element = document.createElement('div');
      element.className = styles.threeLabel;
      element.textContent = text;
      element.setAttribute('aria-hidden', 'true');
      mount.appendChild(element);
      return { object, element, offset };
    });
    const world = new THREE.Vector3();
    const clock = createEngineClock();
    const view = { focus: false, isolate: false };
    const overviewCamera = new THREE.Vector3(5.5, 3.8, 8.4);
    const focusCamera = new THREE.Vector3(3.2, 2.4, 5.2);
    let raf = 0;
    let previous = performance.now();
    let publishedAt = previous;
    let publishedPhase = sampleEngineState(clock.angleDeg).phase.id;

    function setOpacity(object, opacity) {
      object.traverse(child => {
        if (child.material && 'opacity' in child.material) {
          child.material.transparent = opacity < 1 || child.material.transparent;
          child.material.opacity = opacity;
        }
      });
    }
    function publish() {
      const state = sampleEngineState(clock.angleDeg);
      publishedPhase = state.phase.id;
      setSnapshot(state);
    }
    engineRef.current = {
      setMode(next) {
        clock.setRunning(next === 'running');
        view.focus = next === 'focus';
        view.isolate = next === 'isolate';
        publish();
      },
      replay() {
        clock.replay();
        view.focus = false;
        view.isolate = false;
        previous = performance.now();
        publish();
      },
    };

    function resize() {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(360, Math.round(width * 0.56));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    function animate(now) {
      clock.advance(Math.max(0, (now - previous) / 1000));
      previous = now;
      const state = sampleEngineState(clock.angleDeg);
      applyCutawayState(rig, state);
      camera.position.lerp(view.focus ? focusCamera : overviewCamera, view.focus ? 0.08 : 0.06);
      camera.lookAt(0, view.focus ? 1.05 : 0.7, 0);
      setOpacity(rig.block, view.focus ? 0.08 : view.isolate ? 0.02 : 0.28);
      setOpacity(rig.liner, view.focus ? 0.08 : view.isolate ? 0.02 : 0.18);
      const otherOpacity = view.isolate ? 0.09 : 1;
      for (const object of [rig.crankGroup, rig.rod, rig.ports, rig.sparkBody, rig.intakeValve, rig.exhaustValve]) setOpacity(object, otherOpacity);
      setOpacity(rig.head, view.isolate ? 0.06 : CUTAWAY_HEAD_OPACITY);
      renderer.render(scene, camera);
      for (const { object, element, offset } of labels) {
        object.getWorldPosition(world);
        world.y += offset;
        world.project(camera);
        const x = (world.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (-world.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
        element.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
        element.style.opacity = view.isolate && object !== rig.piston ? 0.18 : 0.86;
      }
      if (state.phase.id !== publishedPhase || (clock.running && now - publishedAt >= 100)) {
        setSnapshot(state);
        publishedAt = now;
        publishedPhase = state.phase.id;
      }
      raf = requestAnimationFrame(animate);
    }
    function onContextLost(event) {
      event.preventDefault();
      clock.setRunning(false);
      cancelAnimationFrame(raf);
      engineRef.current = null;
      setRenderStatus('unavailable');
    }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    applyCutawayState(rig, sampleEngineState(0));
    setRenderStatus('ready');
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      engineRef.current = null;
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      disposeObject(scene);
      renderer.dispose();
      labels.forEach(({ element }) => element.remove());
      renderer.domElement.remove();
    };
  }, []);

  function select(next) {
    setMode(next);
    engineRef.current?.setMode(next);
  }

  return <section className={styles.cutaway} aria-label="دورة محرك رباعي الأشواط">
    <div className={styles.sceneHeading}>
      <span dir="ltr">ZZ4 350 reference · single-cylinder cutaway</span>
      <span className={styles.educational}>توقيت تعليمي · INFERRED</span>
    </div>
    <div className={styles.stage} ref={mountRef} aria-busy={renderStatus === 'loading'}>
      {renderStatus === 'loading' && <div className={styles.sceneMessage}>تحضير المشهد…</div>}
      {renderStatus === 'unavailable' && <div className={styles.sceneMessage} role="status">
        <b>العرض ثلاثي الأبعاد غير متاح على هذا الجهاز.</b>
        <span>يتطلب المشهد WebGL. الأبعاد وملاحظات المرجع متاحة أدناه.</span>
      </div>}
      <div className={styles.sceneBadge} aria-hidden="true">أزرق: سحب · ذهبي: عادم · شكل الرأس والمنافذ ومسارات الغاز تخطيطي</div>
    </div>
    <div className={styles.telemetry}>
      <div><small>زاوية الدورة · Cycle</small><strong dir="ltr">{snapshot.angleDeg.toFixed(1)}° <span>/ 720°</span></strong></div>
      <div><small>الشوط الحالي · Phase</small><strong dir="ltr">{snapshot.phase.label}</strong></div>
      <div><small>حركة المكبس · Travel</small><strong dir="ltr">{snapshot.geometry.pistonTravelMm.toFixed(2)} <span>mm</span></strong></div>
    </div>
    <ol className={styles.phases} aria-label="الأشواط الأربعة">
      {PHASES.map((phase, index) => <li key={phase.id} className={snapshot.phase.id === phase.id ? styles.phaseActive : ''} aria-current={snapshot.phase.id === phase.id ? 'step' : undefined}>
        <span>0{index + 1}</span><b>{phase.ar}</b><small lang="en">{phase.en}</small>
      </li>)}
    </ol>
    <div className={styles.controls} aria-label="التحكم بالمشهد">
      <button disabled={renderStatus !== 'ready'} aria-pressed={mode === 'running'} onClick={() => select('running')}>تشغيل الدورة</button>
      <button disabled={renderStatus !== 'ready'} aria-pressed={mode === 'focus'} onClick={() => select('focus')}>تركيز المكبس</button>
      <button disabled={renderStatus !== 'ready'} aria-pressed={mode === 'isolate'} onClick={() => select('isolate')}>عزل المكبس</button>
      <button disabled={renderStatus !== 'ready'} onClick={() => { setMode('running'); engineRef.current?.replay(); }}>↻ إعادة من البداية</button>
      <button disabled={renderStatus !== 'ready'} aria-pressed={mode === 'idle'} onClick={() => select('idle')}>إيقاف</button>
    </div>
    <p className={styles.controlNote}>التركيز والعزل والإيقاف يثبّتون الزاوية الحالية. الإعادة تبدأ دورة جديدة من 0°.</p>
    <p className={styles.timingNote} dir="ltr">Valve events / spark schedule: educational; factory map UNKNOWN</p>
  </section>;
}
