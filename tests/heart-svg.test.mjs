import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync, readFileSync, openSync, closeSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = fileURLToPath(new URL('../scripts/heart-svg.py', import.meta.url));
const parts = [
  'chamber-right-atrium', 'chamber-right-ventricle', 'chamber-left-atrium', 'chamber-left-ventricle',
  'valve-tricuspid', 'valve-pulmonary', 'valve-mitral', 'valve-aortic',
  'vessel-vena-cava', 'vessel-pulmonary-artery', 'vessel-pulmonary-veins', 'vessel-aorta',
  'flow-deoxygenated', 'flow-oxygenated',
];
const routes = {
  'flow-deoxygenated': ['body', 'vessel-vena-cava', 'chamber-right-atrium', 'valve-tricuspid', 'chamber-right-ventricle', 'valve-pulmonary', 'vessel-pulmonary-artery', 'lungs'],
  'flow-oxygenated': ['lungs', 'vessel-pulmonary-veins', 'chamber-left-atrium', 'valve-mitral', 'chamber-left-ventricle', 'valve-aortic', 'vessel-aorta', 'body'],
};
// This deliberately simple vector is a structural TEST fixture, never a heart asset.
const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="premium"><stop stop-color="#a00"/><stop offset="1" stop-color="#faa"/></linearGradient><marker id="arrow"><path d="M0 0L5 3L0 6Z"/></marker></defs>${parts.map((_, i) => `<g id="node-${i}"><path id="path-${i}" fill="url(#premium)" marker-end="url(#arrow)" d="M${i * 20} 20L${i * 20 + 10} 40Z"/></g>`).join('')}${parts.slice(0, 12).map((p, i) => `<text id="text-${i}" x="${i * 20}" y="50">${p}</text>`).join('')}</svg>`;
const mapping = {
  parts: Object.fromEntries(parts.map((p, i) => [p, [`node-${i}`]])),
  labels: Object.fromEntries(parts.slice(0, 12).map((p, i) => [p, [`text-${i}`]])),
  flowRoutes: Object.fromEntries(Object.entries(routes).map(([p, route]) => [p, { pathId: `path-${parts.indexOf(p)}`, route }])),
};
function run(command, payload) {
  const folder = mkdtempSync(join(tmpdir(), 'heart-svg-test-'));
  writeFileSync(join(folder, 'input.json'), JSON.stringify(payload));
  const handles = [openSync(join(folder, 'input.json'), 'r'), openSync(join(folder, 'output.json'), 'w'), openSync(join(folder, 'error.txt'), 'w')];
  try {
    const result = spawnSync('python3', [script, command], { stdio: handles, timeout: 5000 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(readFileSync(join(folder, 'error.txt'), 'utf8').trim());
    return JSON.parse(readFileSync(join(folder, 'output.json'), 'utf8'));
  } finally {
    handles.forEach(closeSync);
    rmSync(folder, { recursive: true, force: true });
  }
}

test('inventory gives addressable vector nodes without changing path/gradient geometry', () => {
  const result = run('inventory', { svg: raw.replace(' id="node-0"', '') });
  assert.ok(result.nodes.some(n => n.id.startsWith('figure-node-') && n.tag === 'g'));
  assert.match(result.svg, /d="M0 20L10 40Z"/);
  assert.match(result.svg, /id="premium"/);
});

test('semantic cleanup produces independent parts and linked labels, preserving paint servers', () => {
  const result = run('semanticize', { svg: raw, mapping });
  const report = run('validate', { svg: result.svg, semantic: true });
  assert.equal(report.semanticParts, 14);
  assert.equal(report.linkedLabels, 12);
  assert.match(result.svg, /id="heart-root"/);
  assert.match(result.svg, /id="vessel-pulmonary-veins"[^>]*data-oxygenation="oxygenated"/);
  assert.match(result.svg, /fill="url\(#premium\)"/);
  assert.equal(report.rasterElements, 0);
});

test('rejects raster images including hidden wrappers and filter images', () => {
  for (const tag of ['<image style="display:none" href="data:image/png;base64,AA=="/>', '<filter><feImage href="#x"/></filter>']) {
    assert.throws(() => run('validate', { svg: raw.replace('</svg>', `${tag}</svg>`) }), /raster|feImage|image/i);
  }
});

test('rejects unsafe/external SVG content and malformed XML', () => {
  for (const tag of ['<script>alert(1)</script>', '<foreignObject/>', '<path onload="x()" d="M0 0L1 1"/>', '<use href="https://other.example/a.svg#x"/>', '<style>@import "https://other.example/a.css";</style>', '<path style="fill:url(https://other.example/a.png)"/>']) {
    assert.throws(() => run('validate', { svg: raw.replace('</svg>', `${tag}</svg>`) }));
  }
  assert.throws(() => run('validate', { svg: raw.replace('</g>', '</x>') }), /XML|mismatch/i);
  assert.throws(() => run('validate', { svg: '<!DOCTYPE svg [<!ENTITY x "oops">]>' + raw }), /DOCTYPE|entity/i);
});

test('rejects duplicate IDs and unresolved local gradient references', () => {
  assert.throws(() => run('validate', { svg: raw.replace('id="node-1"', 'id="node-0"') }), /duplicate/i);
  assert.throws(() => run('validate', { svg: raw.replace('url(#premium)', 'url(#missing)') }), /missing|unresolved/i);
});

test('never guesses semantics or groups unrelated paint-order nodes', () => {
  assert.throws(() => run('semanticize', { svg: raw, mapping: { ...mapping, parts: { ...mapping.parts, 'valve-aortic': [] } } }), /valve-aortic/i);
  assert.throws(() => run('semanticize', { svg: raw, mapping: { ...mapping, parts: { ...mapping.parts, 'chamber-right-atrium': ['node-0', 'node-2'] } } }), /overlap|consecutive|order/i);
  assert.throws(() => run('semanticize', { svg: raw, mapping: { ...mapping, parts: { ...mapping.parts, 'chamber-right-atrium': ['node-0', 'path-0'] } } }), /overlap|nested/i);
});

test('rejects wrong pulmonary return route and blue/deoxygenated semantic declarations', () => {
  const incorrect = structuredClone(mapping);
  incorrect.flowRoutes['flow-oxygenated'].route = [...routes['flow-oxygenated']].reverse();
  assert.throws(() => run('semanticize', { svg: raw, mapping: incorrect }), /direction|route/i);
  const result = run('semanticize', { svg: raw, mapping });
  assert.throws(() => run('validate', { svg: result.svg.replace('id="vessel-pulmonary-veins" data-layer="vessels" data-semantic-part="true" data-oxygenation="oxygenated"', 'id="vessel-pulmonary-veins" data-layer="vessels" data-semantic-part="true" data-oxygenation="deoxygenated"'), semantic: true }), /pulmonary-veins|oxygenated/i);
});

test('semantic validation fails for missing labels or nested control groups', () => {
  const result = run('semanticize', { svg: raw, mapping });
  assert.throws(() => run('validate', { svg: result.svg.replace('data-for="valve-aortic"', 'data-for="not-a-part"'), semantic: true }), /label|not-a-part/i);
  assert.throws(() => run('validate', { svg: result.svg.replace('id="valve-aortic"', 'id="missing-aortic"'), semantic: true }), /valve-aortic/i);
});

test('rejects source stylesheets whose selectors could change under grouping', () => {
  const styled = raw.replace('<defs>', '<style>svg > g > path {fill:red}</style><defs>');
  assert.throws(() => run('semanticize', { svg: styled, mapping }), /stylesheet|computed|inline/i);
});

test('definition containers cannot masquerade as independently rendered chambers', () => {
  const definitions = raw.replace('<g id="node-0">', '<defs id="node-0">').replace('</g>', '</defs>');
  assert.throws(() => run('semanticize', { svg: definitions, mapping }), /definition|rendered|visible/i);
});

test('rejects explicitly hidden anatomy in groups or ancestors', () => {
  for (const attr of ['style="display:none"', 'visibility="hidden"', 'opacity="0"']) {
    const hidden = raw.replace('<g id="node-0">', `<g id="node-0" ${attr}>`);
    assert.throws(() => run('semanticize', { svg: hidden, mapping }), /hidden|visible|rendered/i);
  }
  const result = run('semanticize', { svg: raw, mapping });
  assert.throws(() => run('validate', { svg: result.svg.replace('id="heart-root"', 'id="heart-root" style="display:none"'), semantic: true }), /hidden|visible|rendered/i);
});
