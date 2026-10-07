import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import * as THREE from 'three';

const TARGET = Object.freeze({
  commit: '05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002',
  path: 'app/static-explainer/SmartAssetDemo.js',
  blob: 'b6eac124888b0c1d1c1bbcaffbb56adac1c408e5',
});
const HISTORICAL_FIXTURE = resolve(dirname(fileURLToPath(import.meta.url)), '../tests/fixtures/legacy-smartasset-demo.js.txt');
const TOLERANCE = 1e-9;

function historicalAnimate() {
  // Exact archival text, retained for shallow CI clones; never imported by the app.
  // https://github.com/coantoai/NAHLATY_MY_BEE/blob/05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002/app/static-explainer/SmartAssetDemo.js
  const source = readFileSync(HISTORICAL_FIXTURE, 'utf8');
  const blob = createHash('sha1')
    .update(`blob ${Buffer.byteLength(source)}\0`)
    .update(source)
    .digest('hex');
  if (blob !== TARGET.blob) {
    throw new Error(`Historical source blob mismatch: expected ${TARGET.blob}, received ${blob}`);
  }

  // Preserve the complete function, including its draw and RAF calls. Only the
  // surrounding React/DOM setup is omitted; those calls receive inert fixtures.
  const start = source.indexOf('    function animate(now){');
  const end = source.indexOf('\n    raf=requestAnimationFrame(animate);', start);
  if (start < 0 || end < 0) throw new Error('Cannot extract the pinned animate function');
  return source.slice(start, end);
}

function fixtures() {
  const scene = new THREE.Scene();
  const engine = new THREE.Group();
  scene.add(engine);
  const piston = new THREE.Object3D();
  piston.position.y = 1.35;
  engine.add(piston);
  const crankGroup = new THREE.Group();
  crankGroup.position.y = -1.7;
  engine.add(crankGroup);
  const pin = new THREE.Object3D();
  pin.position.set(0, 0.78, 0);
  crankGroup.add(pin);
  const rod = new THREE.Object3D();
  engine.add(rod);
  const block = new THREE.Object3D();
  const liner = new THREE.Object3D();
  const sparkBody = new THREE.Object3D();
  const sparkGlow = new THREE.Object3D();
  const combustion = new THREE.Object3D();
  for (const object of [block, liner, sparkBody, sparkGlow, combustion, rod]) {
    object.material = { opacity: 0, transparent: true };
  }
  const camera = { position: new THREE.Vector3(5.5, 3.8, 8.4), lookAt() {} };
  const context = vm.createContext({
    THREE, scene, engine, piston, crankGroup, pin, rod,
    block, liner, sparkBody, sparkGlow, combustion, camera,
    state: { running: true, focus: null, isolate: null },
    start: 0,
    raf: 0,
    // No WebGL renderer, pixels, labels, or animation loop are created.
    renderer: { render() {} },
    projectLabel() {},
    pistonLabel: { style: {} },
    crankLabel: { style: {} },
    requestAnimationFrame() { return 0; },
    setOpacity(object, opacity) {
      object.traverse((child) => {
        if (child.material && 'opacity' in child.material) {
          child.material.transparent = opacity < 1 || child.material.transparent;
          child.material.opacity = opacity;
        }
      });
    },
  });
  return { context, engine, piston, crankGroup, pin, rod, sparkGlow };
}

function enginePoint(engine, object, point = new THREE.Vector3()) {
  return engine.worldToLocal(object.localToWorld(point));
}

function result(passed, reason) {
  return { status: passed ? 'PASS' : 'FAIL', reason };
}

/**
 * Diagnose the pinned historical generic scene, not the current ZZ4 target.
 * Positions come from executing its animate function and inspecting Three.js
 * transforms. Scene dimensions are not a factory specification or pixel test.
 */
export function auditLegacyEngine() {
  const source = historicalAnimate();
  const objects = fixtures();
  const animate = new vm.Script(`${source}\nanimate;`, {
    filename: `${TARGET.commit}/${TARGET.path}#animate`,
  }).runInContext(objects.context, { timeout: 1000 });
  const { engine, piston, crankGroup, pin, rod, sparkGlow } = objects;
  const samples = [];
  let crankRadiusError = 0;
  let maxRodEndpointError = 0;
  let minimum = { value: Infinity, angle: null };
  let maximum = { value: -Infinity, angle: null };
  let rodMinimum = Infinity;
  let rodMaximum = -Infinity;
  const sparkIntervals = [];
  let sparkInterval = null;

  // The source's speed is 2.15 radians/second. Timestamp calibration drives the
  // original function through both crank revolutions, including both endpoints.
  for (let angle = 0; angle <= 720; angle += 1) {
    animate((angle * Math.PI / 180) / 2.15 * 1000);
    engine.updateMatrixWorld(true);
    const crankPin = enginePoint(engine, pin);
    const crankCenter = crankGroup.position.clone();
    const pistonCenter = enginePoint(engine, piston);
    // The historical source uses a nominal wrist 1.2 scene units below center.
    const wrist = enginePoint(engine, piston, new THREE.Vector3(0, -1.2, 0));
    // Its unscaled cylinder is 2.7 units high, with endpoints at +/- 1.35.
    const rodUpper = enginePoint(engine, rod, new THREE.Vector3(0, 1.35, 0));
    const rodLower = enginePoint(engine, rod, new THREE.Vector3(0, -1.35, 0));
    const jointDistance = crankPin.distanceTo(wrist);
    const endpointError = Math.max(rodUpper.distanceTo(wrist), rodLower.distanceTo(crankPin));
    crankRadiusError = Math.max(crankRadiusError, Math.abs(crankPin.distanceTo(crankCenter) - 0.78));
    maxRodEndpointError = Math.max(maxRodEndpointError, endpointError);
    rodMinimum = Math.min(rodMinimum, jointDistance);
    rodMaximum = Math.max(rodMaximum, jointDistance);
    if (pistonCenter.y < minimum.value - TOLERANCE) minimum = { value: pistonCenter.y, angle };
    if (pistonCenter.y > maximum.value + TOLERANCE) maximum = { value: pistonCenter.y, angle };
    const sparkActive = sparkGlow.material.opacity > 0;
    if (sparkActive && !sparkInterval) {
      sparkInterval = { startAngle: angle, endAngle: angle };
      sparkIntervals.push(sparkInterval);
    }
    if (sparkActive) sparkInterval.endAngle = angle;
    else sparkInterval = null;
    samples.push({ angle, pistonY: pistonCenter.y });
  }

  const pistonTravel = maximum.value - minimum.value;
  const deadCenterError = Math.max(
    Math.abs(samples[0].pistonY - maximum.value),
    Math.abs(samples[180].pistonY - minimum.value),
  );
  const checks = {
    crankRadius: result(crankRadiusError <= TOLERANCE, 'Measured crank-pin distance from its pivot against the scene radius of 0.78.'),
    rodLength: result(rodMaximum - rodMinimum <= TOLERANCE, 'A rigid connecting rod requires constant crank-pin to nominal piston-wrist distance.'),
    rodEndpoints: result(maxRodEndpointError <= TOLERANCE, 'Compared the transformed cylinder endpoints to the crank pin and nominal wrist; the source clamps rod length to at least 1.6.'),
    sceneTravel: result(Math.abs(pistonTravel - 1.56) <= TOLERANCE, 'Compared measured piston travel to twice the scene crank radius, 1.56; no factory scale is established.'),
    deadCenters: result(deadCenterError <= TOLERANCE, 'The pin is highest at 0 degrees and lowest at 180 degrees, so aligned piston extrema should occur at those angles.'),
    fourStrokeIgnition: result(sparkIntervals.length === 1, 'Counted separate spark-opacity windows over 720 crank degrees; one cylinder in a four-stroke cycle should fire once.'),
    valveTiming: { status: 'UNKNOWN', reason: 'The historical scene supplies no animated intake/exhaust valves or valve event data.' },
    factoryGeometry: { status: 'UNKNOWN', reason: 'The scene is generic and uncalibrated; factory dimensions and a mapping to physical units are absent.' },
    factoryIgnition: { status: 'UNKNOWN', reason: 'The generic spark window is not linked to a factory ignition specification or operating condition.' },
    cinematicPixels: { status: 'UNKNOWN', reason: 'This CPU transform diagnostic creates no WebGL renderer and captures no pixels.' },
    currentZZ4Runtime: { status: 'UNKNOWN', reason: 'Only the pinned historical generic animation is executed; it does not establish behavior of the current ZZ4 target.' },
  };
  return {
    target: { ...TARGET },
    scope: 'Historical generic animation only; not current ZZ4 acceptance evidence',
    execution: 'Blob-verified archival source; original animate function executed in a VM with CPU Three.js fixtures',
    unit: 'scene units; no factory scale established',
    sweep: { startAngle: 0, endAngle: 720, stepDegrees: 1, inclusive: true },
    sampleCount: samples.length,
    measurements: {
      crankRadiusError,
      rodJointDistance: { min: rodMinimum, max: rodMaximum },
      maxRodEndpointError,
      pistonTravel,
      pistonMaximumAngle: maximum.angle,
      pistonMinimumAngle: minimum.angle,
      deadCenterError,
      sparkWindows: sparkIntervals.length,
      sparkIntervals,
    },
    checks,
    ready: Object.values(checks).every((check) => check.status === 'PASS'),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = auditLegacyEngine();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = Object.values(report.checks).some((check) => check.status === 'FAIL') ? 1 : 0;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ target: TARGET, ready: false, error: error.message }, null, 2)}\n`);
    process.exitCode = 1;
  }
}
