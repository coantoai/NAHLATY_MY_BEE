// Factory values below are transcribed from Chevrolet specifications PN 19172321,
// REV 09JA15. Rendering choices and missing dimensions are kept separate.
const factory = (label, value, unit, page, notes = '') => Object.freeze({
  label, value, unit, status: 'VERIFIED', sourceId: 'gm-19172321', page, notes,
});
const unknown = (label, unit, notes, candidateValue = null) => Object.freeze({
  label, value: null, unit, status: 'UNKNOWN', sourceId: null, notes, candidateValue,
});

export const ENGINE_REFERENCE = Object.freeze({
  name: 'Chevrolet Performance ZZ4 350',
  configuration: 'ZZ4 Engine (24502609 Base) Long Block',
  sources: Object.freeze({
    'gm-19172321': Object.freeze({
      title: 'ZZ4 Engine (24502609 Base) Long Block Specifications',
      specificationsPartNumber: '19172321', revision: '09JA15',
      sha256: '30588a340f94cb6e0addf8219ff85e1357cd20a5ee2c3704a6398f62bca96fdc',
      url: 'https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/performance/resources/installation-guides/crate-engines/01-images/zz4-engine-long-block-installation-guide-24502609.pdf',
    }),
    'gm-catalog-2026': Object.freeze({
      title: '2026 Chevrolet Performance Catalog',
      url: 'https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/performance/powertrain/order-catalog/02-pdf/2026_Chevrolet_Performance_CATALOG.pdf',
      sha256: '65920496d9a039ea3533870bbdfe6dae85a51e1cfd6e8c677208f74b63b2c454',
    }),
  }),
  parameters: Object.freeze({
    boreMm: factory('Bore', 101.6, 'mm', 6, 'Published 4.00 in; exact unit conversion.'),
    strokeMm: factory('Stroke', 88.392, 'mm', 6, 'Published 3.48 in; 88.39 mm is a rounded display value.'),
    rodLengthMm: Object.freeze({ label: 'Model rod center distance', value: 144.78, unit: 'mm', status: 'INFERRED', sourceId: 'gm-catalog-2026', page: 63, notes: 'Printed page 122 lists 19435115 rods as 5.700 in and permits 10108688 OR 19435115 with the post-November-1998 ZZ4 crank. Model assumes that factory-compatible replacement; original 10108688 center distance remains UNKNOWN.' }),
    originalRodLengthMm: unknown('Original 10108688 rod center distance', 'mm', 'Assembly 10108688 is listed on long-block page 9; original center distance has not been directly verified.', 144.78),
    displacementCubicIn: factory('Nominal displacement', 350, 'in³', 6, 'Nominal published designation; not an exact volume from rounded bore/stroke.'),
    compressionRatio: factory('Nominal compression ratio', 10, ':1', 6, 'Does not determine chamber shape, deck clearance, or piston crown geometry.'),
    intakeMaxLiftMm: factory('Intake maximum valve lift', 12.0396, 'mm', 6, 'Published .474 in. Not a measured lift-versus-angle curve.'),
    exhaustMaxLiftMm: factory('Exhaust maximum valve lift', 12.954, 'mm', 6, 'Published .510 in. Not a measured lift-versus-angle curve.'),
    intakeDurationDeg: factory('Intake duration', 208, 'crank degrees', 6, 'At .050 in tappet lift; not seat-to-seat duration.'),
    exhaustDurationDeg: factory('Exhaust duration', 221, 'crank degrees', 6, 'At .050 in tappet lift; not seat-to-seat duration.'),
    intakeCenterlineDeg: factory('Intake centerline', 108, 'degrees ATDC', 6),
    exhaustCenterlineDeg: factory('Exhaust centerline', 116, 'degrees BTDC', 6),
    rockerRatio: factory('Rocker ratio', 1.5, ':1', 6),
    chamberVolumeCc: factory('Nominal chamber volume', 58, 'cm³', 6),
    valveAngleDeg: factory('Cylinder-head valve angle', 23, 'degrees', 6, 'Does not establish a measured plug or port coordinate.'),
    intakeValveDiameterMm: factory('Intake valve diameter', 49.276, 'mm', 6, 'Published 1.94 in.'),
    exhaustValveDiameterMm: factory('Exhaust valve diameter', 38.1, 'mm', 6, 'Published 1.50 in.'),
    sparkPlugGapMm: factory('Spark plug gap', 1.016, 'mm', 6, 'Published .040 in; plug ACDelco MR43LTS.'),
    seatValveEvents: unknown('Seat valve opening and closing angles', 'crank degrees', 'Not specified; duration at .050 in is not a seat-event specification.'),
    valveLiftCurve: unknown('Valve lift versus crank angle', 'mm', 'No cam profile or measured lift curve is supplied.'),
    sparkMap: unknown('Ignition advance map', 'crank degrees', 'Two setup recommendations do not specify the complete centrifugal advance curve or every operating condition.'),
    deckClearanceMm: unknown('Deck clearance', 'mm', 'No supported dimension for this cutaway.'),
    crownGeometry: unknown('Piston crown geometry', null, 'High-Silicon aluminum is documented, not the complete crown or relief geometry.'),
    portCoordinates: unknown('Intake/exhaust port coordinates', 'mm', 'Not dimensioned by this specification sheet.'),
    plugCoordinates: unknown('Spark plug coordinates', 'mm', 'Plug type and gap do not supply a location in a cutaway.'),
  }),
  firingOrder: Object.freeze({ value: Object.freeze([1,8,4,3,6,5,7,2]), status: 'VERIFIED', sourceId: 'gm-19172321', page: 4 }),
  ignitionRecommendations: Object.freeze([
    Object.freeze({ advanceDegBTDC: 10, rpm: 650, status: 'VERIFIED', sourceId: 'gm-19172321', page: 5, conditions: 'Initial setting; vacuum advance disconnected and plugged. Guide instructs leaving vacuum advance disconnected.' }),
    Object.freeze({ advanceDegBTDC: 32, rpm: 4000, status: 'VERIFIED', sourceId: 'gm-19172321', page: 4, conditions: 'Total setting; vacuum advance disconnected and plugged; internal centrifugal advance only. Guide instructs leaving vacuum advance disconnected. Startup step 6 on page 5 applies this setting after the engine has warmed up.' }),
  ]),
});

export const VISUAL_ASSUMPTIONS = Object.freeze({
  timingStatus: 'INFERRED',
  intakeWindow: Object.freeze({ openDeg: 0, closeDeg: 180 }),
  exhaustWindow: Object.freeze({ openDeg: 540, closeDeg: 720 }),
  sparkAdvanceDeg: 0,
  sparkWindowDeg: 6,
  speedDegPerSecond: 120,
  notes: 'Educational seat-event windows, sine lift envelope, TDC spark marker, glow duration, and slow playback. These are not factory cam or ignition maps. Both valves are evaluated independently; supported overlap is permitted.',
});
