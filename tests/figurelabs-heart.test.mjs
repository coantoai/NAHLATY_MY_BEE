import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const pipeline = await import('../scripts/figurelabs-heart.mjs').catch(() => ({}));

test('pipeline blocks missing FigureLabs key before creating output or charging', async () => {
  assert.equal(typeof pipeline.generateHeartAsset, 'function');
  const dir = await mkdtemp(join(tmpdir(), 'figure-heart-test-'));
  try {
    await assert.rejects(pipeline.generateHeartAsset({ referencePath: join(dir, 'missing.png'), outputDirectory: join(dir, 'out'), client: { configured: false } }), /FIGURELABS_API_KEY/);
    assert.deepEqual(await readdir(dir), []);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('persists task before polling, downloads and inventories actual vector without expiring URL', async () => {
  assert.equal(typeof pipeline.generateHeartAsset, 'function');
  const dir = await mkdtemp(join(tmpdir(), 'figure-heart-test-'));
  const out = join(dir, 'out');
  const reference = join(dir, 'heart.png');
  await writeFile(reference, Buffer.from([137,80,78,71,13,10,26,10]));
  let submits = 0;
  const client = {
    configured: true,
    uploadLocalBitmap: async () => ({ id: 'file_fixture' }),
    submitVectorization: async () => { submits++; return { task_id: 'tsk_fixture', session_id: 'ses_fixture', status: 'pending' }; },
    waitForSvg: async () => {
      const saved = JSON.parse(await readFile(join(out, 'task.json'), 'utf8'));
      assert.equal(saved.taskId, 'tsk_fixture');
      return { task_id: 'tsk_fixture', status: 'succeeded', output_type: 'image/svg+xml', output_url: 'https://fixture.example/svg?secret=signed' };
    },
    downloadSvg: async () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0 0L10 10Z"/></svg>',
  };
  try {
    const result = await pipeline.generateHeartAsset({ referencePath: reference, outputDirectory: out, client });
    assert.equal(result.taskId, 'tsk_fixture');
    const provenance = await readFile(join(out, 'provenance.json'), 'utf8');
    assert.doesNotMatch(provenance, /signed|output_url|secret=/);
    assert.equal(JSON.parse(provenance).scientificValidation, 'pending-geometry-review');
    assert.match(await readFile(join(out, 'heart-inventory.svg'), 'utf8'), /figure-node-/);
    await pipeline.generateHeartAsset({ referencePath: reference, outputDirectory: out, client });
    assert.equal(submits, 1, 'reusing the same task must not create another paid job');
    await writeFile(reference, 'different-reference');
    await assert.rejects(pipeline.generateHeartAsset({ referencePath: reference, outputDirectory: out, client }), /different reference/i);
    assert.equal(submits, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
