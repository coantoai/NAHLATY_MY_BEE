import test from 'node:test';
import assert from 'node:assert/strict';

let model = {};
try {
  model = await import('../app/lib/engine/zz4Model.js');
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}
// Explicit mathematical fixture; this test is not evidence for a factory rod dimension.
const geometry = { boreMm: 101.6, strokeMm: 88.392, rodLengthMm: 144.78 };
function api(name) {
  assert.equal(typeof model[name], 'function', `engine model needs ${name}`);
  return model[name];
}
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('slider-crank keeps throw and rod length fixed throughout 720 degrees', () => {
  const sample = api('sampleSliderCrank');
  for (let angle = 0; angle <= 720; angle += 0.5) {
    const state = sample(angle, geometry);
    near(Math.hypot(state.crankPin.y, state.crankPin.z), geometry.strokeMm / 2);
    near(Math.hypot(state.wristPin.y - state.crankPin.y, state.wristPin.z - state.crankPin.z), geometry.rodLengthMm);
    near(state.wristPin.z, 0);
  }
});

test('slider-crank reaches exact dead centers and finite-rod midpoint', () => {
  const sample = api('sampleSliderCrank');
  const top = geometry.rodLengthMm + geometry.strokeMm / 2;
  const bottom = geometry.rodLengthMm - geometry.strokeMm / 2;
  for (const angle of [0, 360, 720]) near(sample(angle, geometry).wristPin.y, top);
  for (const angle of [180, 540]) near(sample(angle, geometry).wristPin.y, bottom);
  near(sample(180, geometry).pistonTravelMm, geometry.strokeMm);
  assert.ok(sample(90, geometry).pistonTravelMm > geometry.strokeMm / 2, 'finite rod geometry must differ from an independent sine piston');
});

test('cycle angle wrapping handles negative, fractional and multiple-cycle inputs', () => {
  const wrap = api('normalizeCycleAngle');
  near(wrap(-0.5), 719.5);
  near(wrap(1440.5), 0.5);
  near(wrap(720), 0);
  assert.throws(() => wrap(NaN), /finite/);
  assert.throws(() => wrap(Infinity), /finite/);
});

test('geometry rejects nonphysical or unsupported numeric inputs', () => {
  const sample = api('sampleSliderCrank');
  for (const invalid of [{...geometry, strokeMm: 0}, {...geometry, rodLengthMm: 1}, {...geometry, boreMm: NaN}]) {
    assert.throws(() => sample(0, invalid), /geometry/);
  }
});

test('four-stroke phase distinguishes equal crank positions on different revolutions', () => {
  const sample = api('sampleEngineState');
  for (const [angle, phase] of [[0,'intake'],[179.99,'intake'],[180,'compression'],[359.99,'compression'],[360,'power'],[539.99,'power'],[540,'exhaust'],[719.99,'exhaust'],[720,'intake']]) {
    assert.equal(sample(angle, { geometry }).phase.id, phase);
  }
  near(sample(0, { geometry }).geometry.wristPin.y, sample(360, { geometry }).geometry.wristPin.y);
});

test('valve windows wrap and can overlap without mutual exclusion', () => {
  const lift = api('sampleValveLift');
  const intake = { openDeg: 710, closeDeg: 940 };
  const exhaust = { openDeg: 540, closeDeg: 730 };
  assert.ok(lift(0, intake) > 0 && lift(0, exhaust) > 0);
  near(lift(710, intake), 0);
  near(lift(940, intake), 0);
  near(lift(0, intake), lift(720, intake));
  near(lift(300, intake), 0);
  assert.throws(() => lift(0, {openDeg:0,closeDeg:0}), /window/);
});

test('educational valve schedule is explicit and repeats over 720 degrees', () => {
  const sample = api('sampleEngineState');
  const a = sample(90, {geometry});
  assert.equal(a.timingStatus, 'INFERRED');
  near(a.intakeLiftFraction, 1);
  near(a.exhaustLiftFraction, 0);
  near(sample(630, {geometry}).exhaustLiftFraction, 1);
  for (let angle=0; angle<720; angle+=7.5) {
    const before=sample(angle, {geometry}), after=sample(angle+720, {geometry});
    near(before.intakeLiftFraction, after.intakeLiftFraction);
    near(before.exhaustLiftFraction, after.exhaustLiftFraction);
    assert.equal(before.sparkActive, after.sparkActive);
  }
});

test('spark marker advances before compression TDC and occurs once per 720 degrees', () => {
  const sample = api('sampleEngineState');
  const options = {geometry, sparkAdvanceDeg: 32}; // chosen test operating condition, not a factory spark map
  assert.equal(sample(327.99, options).sparkActive, false);
  assert.equal(sample(328, options).sparkActive, true);
  assert.equal(sample(334, options).sparkActive, false);
  assert.equal(sample(688, options).sparkActive, false);
  assert.equal(sample(0, options).sparkActive, false);
  let windows=0, wasActive=false;
  for(let angle=0;angle<720;angle++) {
    const active=sample(angle,options).sparkActive;
    if(active && !wasActive) windows++;
    wasActive=active;
  }
  assert.equal(windows,1);
  assert.throws(()=>sample(0,{geometry,sparkAdvanceDeg:NaN}), /advance/);
});

test('simulation clock preserves phase when paused and resets only through explicit actions', () => {
  const clock = api('createEngineClock')({ angleDeg: 719, speedDegPerSecond: 120 });
  clock.advance(0.025);
  near(clock.angleDeg, 2);
  clock.setRunning(false);
  clock.advance(100);
  near(clock.angleDeg, 2);
  clock.setRunning(true);
  clock.advance(0.5);
  near(clock.angleDeg, 62);
  clock.reset();
  near(clock.angleDeg, 0);
  assert.equal(clock.running,false);
  clock.replay();
  assert.equal(clock.running,true);
  near(clock.angleDeg,0);
  assert.throws(()=>clock.advance(-1), /seconds/);
});
