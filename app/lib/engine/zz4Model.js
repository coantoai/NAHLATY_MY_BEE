import { ENGINE_REFERENCE, VISUAL_ASSUMPTIONS } from './zz4Reference.js';

const radians = Math.PI / 180;

export function normalizeCycleAngle(angleDeg) {
  if (!Number.isFinite(angleDeg)) throw new RangeError('angle must be finite');
  return ((angleDeg % 720) + 720) % 720;
}

export function getGeometry() {
  const { boreMm, strokeMm, rodLengthMm } = ENGINE_REFERENCE.parameters;
  return {
    boreMm: boreMm.value,
    strokeMm: strokeMm.value,
    rodLengthMm: rodLengthMm.value,
    referenceStatus: rodLengthMm.status,
  };
}

export function sampleSliderCrank(angleDeg, geometry = getGeometry()) {
  const { boreMm, strokeMm, rodLengthMm } = geometry;
  if (![boreMm, strokeMm, rodLengthMm].every(Number.isFinite) || boreMm <= 0 || strokeMm <= 0 || rodLengthMm <= strokeMm / 2) {
    throw new RangeError('geometry needs positive bore/stroke and a rod longer than the crank radius');
  }
  const theta = (normalizeCycleAngle(angleDeg) % 360) * radians;
  const radius = strokeMm / 2;
  const crankPin = { y: radius * Math.cos(theta), z: radius * Math.sin(theta) };
  const wristPin = { y: crankPin.y + Math.sqrt(rodLengthMm ** 2 - crankPin.z ** 2), z: 0 };
  return {
    crankRadiusMm: radius, rodLengthMm,
    crankPin, wristPin,
    rodAngleRad: Math.atan2(-crankPin.z, wristPin.y - crankPin.y),
    pistonTravelMm: rodLengthMm + radius - wristPin.y,
  };
}

const phases = Object.freeze([
  Object.freeze({ id: 'intake', label: 'Intake · سحب', direction: 'down' }),
  Object.freeze({ id: 'compression', label: 'Compression · ضغط', direction: 'up' }),
  Object.freeze({ id: 'power', label: 'Power · قدرة', direction: 'down' }),
  Object.freeze({ id: 'exhaust', label: 'Exhaust · عادم', direction: 'up' }),
]);

// A visual envelope, not a reconstructed cam profile. Windows can cross 720°
// and overlap; intake/exhaust lift is never mutually exclusive.
export function sampleValveLift(angleDeg, { openDeg, closeDeg }) {
  const duration = closeDeg - openDeg;
  if (!Number.isFinite(openDeg) || !Number.isFinite(closeDeg) || duration <= 0 || duration > 720) {
    throw new RangeError('valve window must span more than 0 and no more than 720 degrees');
  }
  const elapsed = normalizeCycleAngle(normalizeCycleAngle(angleDeg) - openDeg);
  return elapsed < duration ? Math.sin(Math.PI * elapsed / duration) : 0;
}

export function sampleEngineState(angleDeg, {
  geometry = getGeometry(),
  intakeWindow = VISUAL_ASSUMPTIONS.intakeWindow,
  exhaustWindow = VISUAL_ASSUMPTIONS.exhaustWindow,
  sparkAdvanceDeg = VISUAL_ASSUMPTIONS.sparkAdvanceDeg,
} = {}) {
  if (!Number.isFinite(sparkAdvanceDeg) || sparkAdvanceDeg < 0 || sparkAdvanceDeg > 90) {
    throw new RangeError('spark advance must be finite and between 0 and 90 crank degrees');
  }
  const angle = normalizeCycleAngle(angleDeg);
  const sinceSpark = normalizeCycleAngle(angle - (360 - sparkAdvanceDeg));
  return {
    angleDeg: angle,
    crankAngleRad: (angle % 360) * radians,
    phase: phases[Math.floor(angle / 180)],
    geometry: sampleSliderCrank(angle, geometry),
    intakeLiftFraction: sampleValveLift(angle, intakeWindow),
    exhaustLiftFraction: sampleValveLift(angle, exhaustWindow),
    intakeMaxLiftMm: ENGINE_REFERENCE.parameters.intakeMaxLiftMm.value,
    exhaustMaxLiftMm: ENGINE_REFERENCE.parameters.exhaustMaxLiftMm.value,
    sparkActive: sinceSpark < VISUAL_ASSUMPTIONS.sparkWindowDeg,
    combustionFraction: angle >= 360 && angle < 540 ? Math.max(0, 1 - (angle - 360) / 180) : 0,
    timingStatus: 'INFERRED',
  };
}

export function createEngineClock({ angleDeg = 0, speedDegPerSecond = VISUAL_ASSUMPTIONS.speedDegPerSecond } = {}) {
  if (!Number.isFinite(speedDegPerSecond) || speedDegPerSecond <= 0) throw new RangeError('speed must be finite and positive');
  let angle = normalizeCycleAngle(angleDeg), running = true;
  return {
    get angleDeg() { return angle; },
    get running() { return running; },
    advance(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('seconds must be finite and nonnegative');
      if (running) angle = normalizeCycleAngle(angle + (seconds % (720 / speedDegPerSecond)) * speedDegPerSecond);
      return angle;
    },
    setRunning(value) { running = Boolean(value); },
    replay() { angle = 0; running = true; },
    reset() { angle = 0; running = false; },
  };
}
