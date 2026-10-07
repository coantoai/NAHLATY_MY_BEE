import test from 'node:test';
import assert from 'node:assert/strict';
import { ENGINE_REFERENCE, VISUAL_ASSUMPTIONS } from '../app/lib/engine/zz4Reference.js';
import { getGeometry } from '../app/lib/engine/zz4Model.js';

test('factory constants retain exact published units when converted', () => {
  const { parameters } = ENGINE_REFERENCE;
  for (const [parameter, inches] of [[parameters.boreMm,4], [parameters.strokeMm,3.48], [parameters.intakeMaxLiftMm,0.474], [parameters.exhaustMaxLiftMm,0.510]]) {
    assert.ok(Math.abs(parameter.value - inches * 25.4) < 1e-10, parameter.label);
  }
  assert.equal(parameters.intakeDurationDeg.value, 208);
  assert.equal(parameters.exhaustDurationDeg.value, 221);
  assert.match(parameters.intakeDurationDeg.notes, /\.050.*tappet/);
});

test('every engineering parameter keeps a source-backed epistemic status', () => {
  for (const parameter of Object.values(ENGINE_REFERENCE.parameters)) {
    assert.ok(['VERIFIED','INFERRED','UNKNOWN'].includes(parameter.status), parameter.label);
    if (parameter.status === 'UNKNOWN') {
      assert.equal(parameter.value, null, parameter.label);
      assert.ok(parameter.notes);
    } else {
      assert.ok(ENGINE_REFERENCE.sources[parameter.sourceId], parameter.label);
      assert.ok(parameter.page > 0, parameter.label);
      assert.match(ENGINE_REFERENCE.sources[parameter.sourceId].url, /^https:\/\/www\.chevrolet\.com\//);
      assert.match(ENGINE_REFERENCE.sources[parameter.sourceId].sha256, /^[a-f0-9]{64}$/);
    }
  }
});

test('active rod geometry is a compatible-part inference, not a verified original dimension', () => {
  const { rodLengthMm, originalRodLengthMm } = ENGINE_REFERENCE.parameters;
  assert.equal(rodLengthMm.status,'INFERRED');
  assert.ok(Math.abs(rodLengthMm.value - 5.7 * 25.4) < 1e-10);
  assert.match(rodLengthMm.notes,/19435115/);
  assert.equal(originalRodLengthMm.status,'UNKNOWN');
  assert.equal(getGeometry().referenceStatus,'INFERRED');
});

test('ignition recommendations keep RPM and vacuum conditions separate from educational defaults', () => {
  assert.deepEqual(ENGINE_REFERENCE.ignitionRecommendations.map(x=>[x.advanceDegBTDC,x.rpm]),[[10,650],[32,4000]]);
  for(const setting of ENGINE_REFERENCE.ignitionRecommendations) assert.match(setting.conditions,/vacuum advance disconnected and plugged/i);
  assert.equal(ENGINE_REFERENCE.parameters.sparkMap.status,'UNKNOWN');
  assert.equal(ENGINE_REFERENCE.parameters.seatValveEvents.status,'UNKNOWN');
  assert.equal(ENGINE_REFERENCE.parameters.valveLiftCurve.status,'UNKNOWN');
  assert.equal(VISUAL_ASSUMPTIONS.timingStatus,'INFERRED');
  assert.equal(VISUAL_ASSUMPTIONS.sparkAdvanceDeg,0);
});
