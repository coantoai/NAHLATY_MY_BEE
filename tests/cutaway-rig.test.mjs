import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ENGINE_REFERENCE } from '../app/lib/engine/zz4Reference.js';

let adapter;
let model;
try {
  adapter = await import('../app/lib/engine/cutawayRig.js');
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}
try {
  model = await import('../app/lib/engine/zz4Model.js');
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

function setup() {
  assert.equal(typeof adapter?.createCutawayRig, 'function', 'a real Three.js cutaway rig is required');
  assert.equal(typeof adapter?.applyCutawayState, 'function', 'the rig must consume the shared sampled state');
  assert.equal(typeof model?.sampleEngineState, 'function', 'the shared engine state model is required');
  const geometry = model.getGeometry();
  return { rig: adapter.createCutawayRig(geometry), scale: 0.78 / (geometry.strokeMm / 2), geometry };
}

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} versus ${expected}`);
}

function closeVector(actual, expected, message) {
  close(actual.x, expected.x, `${message} x`);
  close(actual.y, expected.y, `${message} y`);
  close(actual.z, expected.z, `${message} z`);
}

function apply(rig, angle) {
  const state = model.sampleEngineState(angle);
  adapter.applyCutawayState(rig, state);
  rig.group.updateMatrixWorld(true);
  return state;
}

test('rendered crank pin matches the sampled crank geometry over 720 degrees', () => {
  const { rig, scale } = setup();
  for (let angle = 0; angle <= 720; angle++) {
    const state = apply(rig, angle);
    const pin = rig.pin.getWorldPosition(new THREE.Vector3());
    closeVector(pin, new THREE.Vector3(0, -1.7 + state.geometry.crankPin.y * scale, state.geometry.crankPin.z * scale), `crank pin at ${angle}`);
    close(Math.hypot(pin.y + 1.7, pin.z), state.geometry.crankRadiusMm * scale, `crank radius at ${angle}`);
  }
});

test('the actual rod mesh connects the wrist and crank pin with constant length', () => {
  const { rig, scale, geometry } = setup();
  const wrist = rig.group.getObjectByName('wristNominal');
  assert.ok(wrist, 'a nominal wrist pin attached to the piston is required');
  close(wrist.position.y, -0.7, 'schematic wrist offset from crown center');
  for (let angle = 0; angle <= 720; angle++) {
    const state = apply(rig, angle);
    const halfHeight = rig.rod.geometry.parameters.height / 2;
    const top = rig.rod.localToWorld(new THREE.Vector3(0, halfHeight, 0));
    const bottom = rig.rod.localToWorld(new THREE.Vector3(0, -halfHeight, 0));
    const wristWorld = wrist.getWorldPosition(new THREE.Vector3());
    closeVector(top, wristWorld, `rod wrist endpoint at ${angle}`);
    closeVector(bottom, rig.pin.getWorldPosition(new THREE.Vector3()), `rod crank endpoint at ${angle}`);
    closeVector(wristWorld, new THREE.Vector3(0, -1.7 + state.geometry.wristPin.y * scale, state.geometry.wristPin.z * scale), `sampled wrist at ${angle}`);
    close(top.distanceTo(bottom), geometry.rodLengthMm * scale, `fixed rod length at ${angle}`);
  }
});

test('piston travel equals the reference stroke without crown rotation', () => {
  const { rig, scale, geometry } = setup();
  let low = Infinity;
  let high = -Infinity;
  for (let angle = 0; angle <= 720; angle++) {
    apply(rig, angle);
    low = Math.min(low, rig.piston.position.y);
    high = Math.max(high, rig.piston.position.y);
    assert.deepEqual(rig.piston.rotation.toArray().slice(0, 3), [0, 0, 0]);
  }
  close(high - low, geometry.strokeMm * scale, 'rendered full stroke');
});

test('reapplying one frozen state restores exactly the same mesh transforms', () => {
  const { rig } = setup();
  const frozenState = apply(rig, 413.25);
  const objects = [rig.piston, rig.rod, rig.crankGroup, rig.pin, rig.intakeValve, rig.exhaustValve, rig.sparkGlow, rig.combustion];
  const pose = objects.map(object => object.matrixWorld.toArray());
  apply(rig, 91);
  adapter.applyCutawayState(rig, frozenState);
  rig.group.updateMatrixWorld(true);
  assert.deepEqual(objects.map(object => object.matrixWorld.toArray()), pose);
});

test('both schematic valve meshes can lift together during an overlap fixture', () => {
  const { rig } = setup();
  const state = model.sampleEngineState(360);
  adapter.applyCutawayState(rig, { ...state, intakeLiftFraction: 0, exhaustLiftFraction: 0 });
  const closed = [rig.intakeValve.position.y, rig.exhaustValve.position.y];
  adapter.applyCutawayState(rig, { ...state, intakeLiftFraction: 0.63, exhaustLiftFraction: 0.44 });
  assert.ok(rig.intakeValve.position.y < closed[0], 'intake valve opens into the cylinder');
  assert.ok(rig.exhaustValve.position.y < closed[1], 'exhaust valve also opens into the cylinder');
  adapter.applyCutawayState(rig, { ...state, intakeLiftFraction: 0, exhaustLiftFraction: 0 });
  assert.deepEqual([rig.intakeValve.position.y, rig.exhaustValve.position.y], closed);
});

test('spark and combustion meshes follow the supplied indicators rather than their own clock', () => {
  const { rig } = setup();
  const state = model.sampleEngineState(25);
  adapter.applyCutawayState(rig, { ...state, sparkActive: true, combustionFraction: 0.6 });
  assert.ok(rig.sparkGlow.material.opacity > 0);
  assert.ok(rig.combustion.material.opacity > 0);
  adapter.applyCutawayState(rig, { ...state, sparkActive: false, combustionFraction: 0 });
  assert.equal(rig.sparkGlow.material.opacity, 0);
  assert.equal(rig.combustion.material.opacity, 0);
});

test('the cylinder liner radius represents the verified bore with piston clearance inside it', () => {
  const { rig, geometry, scale } = setup();
  close(rig.liner.geometry.parameters.radiusTop, geometry.boreMm * scale / 2, 'physical liner bore radius');
  close(rig.liner.geometry.parameters.radiusBottom, geometry.boreMm * scale / 2, 'physical liner lower bore radius');
  const crown = rig.piston.children.find(child => child.geometry?.type === 'CylinderGeometry');
  assert.ok(crown.geometry.parameters.radiusTop < rig.liner.geometry.parameters.radiusTop, 'schematic piston fits inside the reference bore');
});

test('valves use published angle and disk diameters while lifting along their stem axes', () => {
  const { rig, scale } = setup();
  const state = model.sampleEngineState(90);
  adapter.applyCutawayState(rig, { ...state, intakeLiftFraction: 0, exhaustLiftFraction: 0 });
  const closed = [rig.intakeValve.position.clone(), rig.exhaustValve.position.clone()];
  adapter.applyCutawayState(rig, { ...state, intakeLiftFraction: 1, exhaustLiftFraction: 1 });
  for (const [index, valve, diameterKey, maxLiftMm] of [
    [0, rig.intakeValve, 'intakeValveDiameterMm', state.intakeMaxLiftMm],
    [1, rig.exhaustValve, 'exhaustValveDiameterMm', state.exhaustMaxLiftMm],
  ]) {
    const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(valve.quaternion);
    close(axis.angleTo(new THREE.Vector3(0, 1, 0)), ENGINE_REFERENCE.parameters.valveAngleDeg.value * Math.PI / 180, 'published valve angle');
    const displacement = valve.position.clone().sub(closed[index]);
    close(displacement.length(), maxLiftMm * scale, 'published maximum valve lift');
    closeVector(displacement.clone().normalize(), axis.negate(), 'opening displacement follows the stem');
    const disk = valve.getObjectByName('valveDisk');
    assert.ok(disk, 'valve disk is identifiable');
    close(disk.geometry.parameters.radiusTop, ENGINE_REFERENCE.parameters[diameterKey].value * scale / 2, 'published valve disk radius');
  }
});

test('schematic gas markers are gated independently by valve lift and follow one sampled angle', () => {
  const { rig } = setup();
  const state = model.sampleEngineState(90);
  assert.ok(rig.intakeFlow && rig.exhaustFlow, 'intake and exhaust flow indicators are required');
  adapter.applyCutawayState(rig, { ...state, intakeLiftFraction: 0, exhaustLiftFraction: 0 });
  assert.equal(rig.intakeFlow.material.opacity, 0);
  assert.equal(rig.exhaustFlow.material.opacity, 0);
  const overlap = { ...state, intakeLiftFraction: 0.6, exhaustLiftFraction: 0.7 };
  adapter.applyCutawayState(rig, overlap);
  assert.ok(rig.intakeFlow.material.opacity > 0);
  assert.ok(rig.exhaustFlow.material.opacity > 0);
  const pose = [rig.intakeFlow.position.toArray(), rig.exhaustFlow.position.toArray()];
  adapter.applyCutawayState(rig, { ...overlap, angleDeg: 130 });
  assert.notDeepEqual([rig.intakeFlow.position.toArray(), rig.exhaustFlow.position.toArray()], pose, 'flow advances with sampled angle');
  adapter.applyCutawayState(rig, overlap);
  assert.deepEqual([rig.intakeFlow.position.toArray(), rig.exhaustFlow.position.toArray()], pose, 'reapplied frozen angle restores the flow');
});

test('presentation floor stays below the moving crank and rod at both dead centers', () => {
  const { rig } = setup();
  assert.ok(Number.isFinite(adapter.CUTAWAY_FLOOR_Y), 'the renderer must use a shared presentation floor height');
  for (const angle of [0,90,180,270,360,450,540,630,720]) {
    apply(rig, angle);
    for (const object of [rig.crankGroup, rig.rod]) {
      const bounds = new THREE.Box3().setFromObject(object);
      assert.ok(adapter.CUTAWAY_FLOOR_Y < bounds.min.y, `floor hides rotating assembly at ${angle} degrees`);
    }
  }
});

test('combustion cue stays inside the schematic gas envelope during the power stroke', () => {
  const { rig } = setup();
  const boreRadius = rig.liner.geometry.parameters.radiusTop;
  const headBottom = rig.head.position.y - rig.head.geometry.parameters.height / 2;
  const crown = rig.piston.children.find(child=>child.geometry?.type === 'CylinderGeometry');
  for(const angle of [360,400,450,500,539]) {
    apply(rig,angle);
    const bounds = new THREE.Box3().setFromObject(rig.combustion);
    const crownTop = rig.piston.position.y + crown.geometry.parameters.height / 2;
    assert.ok(bounds.min.y >= crownTop, `combustion cue enters piston at ${angle}`);
    assert.ok(bounds.max.y <= headBottom, `combustion cue enters head at ${angle}`);
    assert.ok(bounds.max.x <= boreRadius && bounds.min.x >= -boreRadius, 'combustion cue leaves bore envelope');
    assert.ok(bounds.max.z <= boreRadius && bounds.min.z >= -boreRadius, 'combustion cue leaves bore depth envelope');
  }
});

test('schematic head permits seeing the gas marker paths rather than occluding them', () => {
  const { rig } = setup();
  for(const [angle,key] of [[90,'intakeFlow'],[630,'exhaustFlow']]) {
    apply(rig,angle);
    const bounds = new THREE.Box3().setFromObject(rig.head);
    const marker = rig[key].getWorldPosition(new THREE.Vector3());
    if(bounds.containsPoint(marker)) {
      assert.equal(rig.head.material.transparent,true,'head must be a cutaway envelope where flow crosses it');
      assert.ok(rig.head.material.opacity < 0.5,'opaque head hides peak-flow marker');
      assert.equal(rig.head.material.depthWrite,false,'transparent head must not write an occluding depth surface');
    }
  }
});

test('schematic cylinder reaches the head and encloses the TDC crown', () => {
  const { rig } = setup();
  apply(rig,360);
  const linerTop = rig.liner.position.y + rig.liner.geometry.parameters.height / 2;
  const headBottom = rig.head.position.y - rig.head.geometry.parameters.height / 2;
  const crown = rig.piston.children.find(child=>child.geometry?.type === 'CylinderGeometry');
  const crownTop = rig.piston.position.y + crown.geometry.parameters.height / 2;
  close(linerTop,headBottom,'schematic liner-to-head closure');
  assert.ok(crownTop < linerTop,'TDC crown must stay within the drawn cylinder');
});

test('visible spark cue stays between the schematic crown and head at compression TDC', () => {
  const { rig } = setup();
  const boreRadius = rig.liner.geometry.parameters.radiusTop;
  const headBottom = rig.head.position.y - rig.head.geometry.parameters.height / 2;
  const crown = rig.piston.children.find(child => child.geometry?.type === 'CylinderGeometry');
  for (const angle of [360, 361, 362, 363, 364, 365]) {
    const state = model.sampleEngineState(angle);
    assert.equal(state.sparkActive, true);
    adapter.applyCutawayState(rig, state);
    const bounds = new THREE.Box3().setFromObject(rig.sparkGlow);
    const crownTop = rig.piston.position.y + crown.geometry.parameters.height / 2;
    assert.ok(bounds.min.y >= crownTop, `spark cue enters piston at ${angle}`);
    assert.ok(bounds.max.y <= headBottom, `spark cue enters head at ${angle}`);
    assert.ok(bounds.max.x <= boreRadius && bounds.min.x >= -boreRadius, 'spark cue leaves bore envelope');
    assert.ok(bounds.max.z <= boreRadius && bounds.min.z >= -boreRadius, 'spark cue leaves bore depth envelope');
  }
});
