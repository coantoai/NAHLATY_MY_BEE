import test from 'node:test';
import assert from 'node:assert/strict';

let auditLegacyEngine;
try {
  ({ auditLegacyEngine } = await import('../scripts/qa-legacy-engine.mjs'));
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

function report() {
  assert.equal(typeof auditLegacyEngine, 'function', 'source-pinned legacy animation diagnostic is required');
  return auditLegacyEngine();
}

test('legacy diagnostic identifies its exact historical target and inclusive sweep', () => {
  const result = report();
  assert.equal(result.target.commit, '05b9e48c6c17b934c4d5ad73972fdd7b2bfc6002');
  assert.equal(result.target.blob, 'b6eac124888b0c1d1c1bbcaffbb56adac1c408e5');
  assert.equal(result.sampleCount, 721);
  assert.equal(result.unit, 'scene units; no factory scale established');
});

test('legacy animation preserves crank radius but violates fixed rod length', () => {
  const { checks, measurements } = report();
  assert.equal(checks.crankRadius.status, 'PASS');
  assert.ok(measurements.crankRadiusError < 1e-9);
  assert.equal(checks.rodLength.status, 'FAIL');
  assert.ok(measurements.rodJointDistance.max - measurements.rodJointDistance.min > 2);
});

test('legacy scaled rod visibly misses its nominal endpoints when clamped', () => {
  const result = report();
  assert.equal(result.checks.rodEndpoints.status, 'FAIL');
  assert.ok(result.measurements.maxRodEndpointError > 0.2);
});

test('legacy piston travel matches the scene throw but its dead centers are out of phase', () => {
  const { checks, measurements } = report();
  assert.equal(checks.sceneTravel.status, 'PASS');
  assert.ok(Math.abs(measurements.pistonTravel - 1.56) < 1e-9);
  assert.equal(checks.deadCenters.status, 'FAIL');
  assert.equal(measurements.pistonMaximumAngle, 90);
  assert.equal(measurements.pistonMinimumAngle, 270);
});

test('legacy spark repeats twice across a four-stroke cycle', () => {
  const result = report();
  assert.equal(result.measurements.sparkWindows, 2);
  assert.equal(result.checks.fourStrokeIgnition.status, 'FAIL');
});

test('legacy audit keeps unavailable valve, factory, and pixel checks unknown', () => {
  const result = report();
  for (const key of ['valveTiming', 'factoryGeometry', 'factoryIgnition', 'cinematicPixels', 'currentZZ4Runtime']) {
    assert.equal(result.checks[key].status, 'UNKNOWN');
    assert.ok(result.checks[key].reason);
  }
  assert.equal(result.ready, false);
});
