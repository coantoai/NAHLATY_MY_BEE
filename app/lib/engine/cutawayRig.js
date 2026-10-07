import * as THREE from 'three';
import { getGeometry } from './zz4Model.js';
import { ENGINE_REFERENCE } from './zz4Reference.js';

// INFERRED display layout, not a factory block/deck/clearance specification.
const DISPLAY_LAYOUT = Object.freeze({ headCenterY: 3.13, headHeight: 0.44, linerBottomY: -1.5 });
export const CUTAWAY_FLOOR_Y = -2.95;
export const CUTAWAY_HEAD_OPACITY = 0.28;

// Preserve the legacy scene's 0.78 throw. Only the rotating assembly and bore
// use the reference scale. Valve angle, disk diameters, and maximum lift are
// documented; their locations, stem shape, azimuth, and gas paths are schematic.
export function createCutawayRig(geometry = getGeometry()) {
  const sceneScale = 0.78 / (geometry.strokeMm / 2);
  const boreRadius = geometry.boreMm * sceneScale / 2;
  const crownRadius = boreRadius - 0.08; // Visual clearance; actual clearance is UNKNOWN.
  const group = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xaeb7b3, metalness: 0.86, roughness: 0.26, clearcoat: 0.25 });
  const darkMetal = new THREE.MeshPhysicalMaterial({ color: 0x303936, metalness: 0.9, roughness: 0.22 });
  const brass = new THREE.MeshPhysicalMaterial({ color: 0xb98b46, metalness: 0.72, roughness: 0.28 });
  const chamberMat = new THREE.MeshPhysicalMaterial({ color: 0x18211d, metalness: 0.55, roughness: 0.38, transparent: true, opacity: 0.28, side: THREE.DoubleSide });

  const block = new THREE.Mesh(new THREE.BoxGeometry(3.9, 5.2, 3.15), chamberMat);
  block.position.y = 0.1;
  block.castShadow = true;
  group.add(block);

  const linerTop = DISPLAY_LAYOUT.headCenterY - DISPLAY_LAYOUT.headHeight / 2;
  const linerHeight = linerTop - DISPLAY_LAYOUT.linerBottomY;
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(boreRadius, boreRadius, linerHeight, 64, 1, true), chamberMat.clone());
  liner.material.opacity = 0.18;
  liner.position.y = (linerTop + DISPLAY_LAYOUT.linerBottomY) / 2;
  group.add(liner);

  const piston = new THREE.Group();
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(crownRadius, crownRadius, 0.72, 64), metal);
  crown.castShadow = true;
  piston.add(crown);
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(crownRadius * 0.933, crownRadius * 0.933, 1.05, 64), metal);
  skirt.position.y = -0.73;
  skirt.castShadow = true;
  piston.add(skirt);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(crownRadius * 0.962, 0.045, 12, 72), darkMetal);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = 0.22;
  piston.add(ring1);
  const ring2 = ring1.clone();
  ring2.position.y = 0.02;
  piston.add(ring2);
  const wristNominal = new THREE.Object3D();
  wristNominal.name = 'wristNominal';
  wristNominal.position.y = -0.7;
  piston.add(wristNominal);
  group.add(piston);

  const crankGroup = new THREE.Group();
  crankGroup.position.y = -1.7;
  group.add(crankGroup);
  const crankshaft = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 3.7, 48), darkMetal);
  crankshaft.rotation.z = Math.PI / 2;
  crankshaft.castShadow = true;
  crankGroup.add(crankshaft);
  const wheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.28, 64), darkMetal);
  wheelL.rotation.z = Math.PI / 2;
  wheelL.position.x = -1.25;
  wheelL.castShadow = true;
  crankGroup.add(wheelL);
  const wheelR = wheelL.clone();
  wheelR.position.x = 1.25;
  crankGroup.add(wheelR);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.72, 32), brass);
  pin.rotation.z = Math.PI / 2;
  pin.position.set(0, geometry.strokeMm * sceneScale / 2, 0);
  crankGroup.add(pin);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.7, 32), brass.clone());
  rod.scale.y = geometry.rodLengthMm * sceneScale / 2.7;
  rod.castShadow = true;
  group.add(rod);

  const headMaterial = darkMetal.clone();
  headMaterial.transparent = true;
  headMaterial.opacity = CUTAWAY_HEAD_OPACITY;
  headMaterial.depthWrite = false;
  const head = new THREE.Mesh(new THREE.BoxGeometry(2.7, DISPLAY_LAYOUT.headHeight, 2.3), headMaterial);
  head.position.y = DISPLAY_LAYOUT.headCenterY;
  head.castShadow = true;
  group.add(head);
  const ports = new THREE.Group();
  for (const [x, color] of [[-1.36, 0x6fb7ff], [1.36, 0xb98b46]]) {
    const port = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.95, 32, 1, true), new THREE.MeshPhysicalMaterial({ color, metalness: 0.65, roughness: 0.3, side: THREE.DoubleSide }));
    port.rotation.z = Math.PI / 2;
    port.position.set(x, 3.16, 0.12);
    ports.add(port);
  }
  group.add(ports);

  function makeValve(x, color, diameterMm) {
    const valve = new THREE.Group();
    const material = new THREE.MeshPhysicalMaterial({ color, metalness: 0.78, roughness: 0.24 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.46, 20), material);
    stem.position.y = 0.23;
    const radius = diameterMm * sceneScale / 2;
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.065, 32), material);
    disk.name = 'valveDisk';
    valve.add(stem, disk);
    valve.position.set(x, 2.98, 0.1);
    valve.rotation.z = (x < 0 ? 1 : -1) * ENGINE_REFERENCE.parameters.valveAngleDeg.value * Math.PI / 180;
    valve.userData.closedPosition = valve.position.clone();
    valve.userData.openDirection = new THREE.Vector3(0, -1, 0).applyQuaternion(valve.quaternion);
    group.add(valve);
    return valve;
  }
  const intakeValve = makeValve(-0.5, 0x6fb7ff, ENGINE_REFERENCE.parameters.intakeValveDiameterMm.value);
  const exhaustValve = makeValve(0.5, 0xb98b46, ENGINE_REFERENCE.parameters.exhaustValveDiameterMm.value);
  function makeFlow(x, color, reverse) {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 12), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
    const points = [new THREE.Vector3(x * 1.8, 3.16, 0.12), new THREE.Vector3(x * 0.95, 3.16, 0.12), new THREE.Vector3(x * 0.5, 2.94, 0.1), new THREE.Vector3(x * 0.2, 2.48, 0.3)];
    marker.userData.path = new THREE.CatmullRomCurve3(reverse ? points.reverse() : points);
    group.add(marker);
    return marker;
  }
  const intakeFlow = makeFlow(-1, 0x6fb7ff, false);
  const exhaustFlow = makeFlow(1, 0xf4b35f, true);
  const sparkBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 32), darkMetal);
  sparkBody.position.set(0, 3.43, 0);
  group.add(sparkBody);
  const sparkGlow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffc25a, transparent: true, opacity: 0 }));
  sparkGlow.position.set(0, 2.84, 0);
  group.add(sparkGlow);
  const combustion = new THREE.Mesh(new THREE.SphereGeometry(0.66, 48, 48), new THREE.MeshBasicMaterial({ color: 0xff8b3d, transparent: true, opacity: 0, depthWrite: false }));
  group.add(combustion);

  return { group, piston, rod, crankGroup, pin, intakeValve, exhaustValve, intakeFlow, exhaustFlow, sparkGlow, combustion, block, liner, head, ports, sparkBody, sceneScale };
}

export function applyCutawayState(rig, state) {
  const { geometry } = state;
  const scale = rig.sceneScale;
  const pinY = -1.7 + geometry.crankPin.y * scale;
  const pinZ = geometry.crankPin.z * scale;
  const wristY = -1.7 + geometry.wristPin.y * scale;
  const wristZ = geometry.wristPin.z * scale;
  rig.crankGroup.rotation.x = state.crankAngleRad;
  rig.pin.position.set(0, geometry.crankRadiusMm * scale, 0);
  rig.piston.position.set(0, wristY + 0.7, wristZ);
  rig.piston.rotation.set(0, 0, 0);
  rig.rod.position.set(0, (wristY + pinY) / 2, (wristZ + pinZ) / 2);
  rig.rod.rotation.set(Math.atan2(wristZ - pinZ, wristY - pinY), 0, 0);
  rig.intakeValve.position.copy(rig.intakeValve.userData.closedPosition).addScaledVector(rig.intakeValve.userData.openDirection, state.intakeLiftFraction * state.intakeMaxLiftMm * scale);
  rig.exhaustValve.position.copy(rig.exhaustValve.userData.closedPosition).addScaledVector(rig.exhaustValve.userData.openDirection, state.exhaustLiftFraction * state.exhaustMaxLiftMm * scale);
  // Progress illustrates direction over the nominal 180° phase. It is not a
  // measured gas velocity or CFD result. Each valve independently gates flow.
  const progress = (state.angleDeg % 180) / 180;
  rig.intakeFlow.position.copy(rig.intakeFlow.userData.path.getPoint(progress));
  rig.exhaustFlow.position.copy(rig.exhaustFlow.userData.path.getPoint(progress));
  rig.intakeFlow.material.opacity = state.intakeLiftFraction * 0.85;
  rig.exhaustFlow.material.opacity = state.exhaustLiftFraction * 0.85;
  rig.sparkGlow.material.opacity = state.sparkActive ? 0.95 : 0;
  rig.combustion.material.opacity = state.combustionFraction * 0.26;
  // Bound the artistic cue to the schematic gas space. Its shape and opacity
  // are not a flame front, pressure field, or measured combustion chamber.
  const crown = rig.piston.children[0];
  const crownTop = rig.piston.position.y + crown.geometry.parameters.height / 2;
  const headBottom = rig.head.position.y - rig.head.geometry.parameters.height / 2;
  const gasHeight = Math.max(0, headBottom - crownTop);
  const sphereRadius = rig.combustion.geometry.parameters.radius;
  const gasRadius = rig.liner.geometry.parameters.radiusTop * 0.9;
  // The spark is an artistic event marker, not a measured electrode location.
  // Keep its visible envelope within the same schematic gas space.
  const sparkRadius = rig.sparkGlow.geometry.parameters.radius;
  const sparkDisplayRadius = Math.min(sparkRadius * (state.sparkActive ? 1.7 : 0.7), gasRadius);
  rig.sparkGlow.scale.set(sparkDisplayRadius / sparkRadius, Math.min(sparkDisplayRadius, gasHeight * 0.44) / sparkRadius, sparkDisplayRadius / sparkRadius);
  rig.sparkGlow.position.set(0, crownTop + gasHeight / 2, 0);
  rig.combustion.scale.set(gasRadius / sphereRadius, gasHeight * 0.44 / sphereRadius, gasRadius / sphereRadius);
  rig.combustion.position.set(0, crownTop + gasHeight / 2, 0);
}
