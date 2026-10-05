import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { mkdtempSync, writeFileSync, readFileSync, openSync, closeSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createFigureLabsClient } from './lib/figurelabs-client.mjs';

const svgTool = fileURLToPath(new URL('./heart-svg.py', import.meta.url));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const SOURCES = ['https://www.nhlbi.nih.gov/health/heart/blood-flow', 'https://www.nhlbi.nih.gov/health/heart/anatomy'];
export function runSvgTool(command, payload) {
  const folder = mkdtempSync(join(tmpdir(), 'nahlaty-svg-'));
  writeFileSync(join(folder, 'input.json'), JSON.stringify(payload), { mode: 0o600 });
  const handles = [openSync(join(folder, 'input.json'), 'r'), openSync(join(folder, 'output.json'), 'w', 0o600), openSync(join(folder, 'error.txt'), 'w', 0o600)];
  try {
    const result = spawnSync('python3', [svgTool, command], { stdio: handles, timeout: 30_000 });
    if (result.error) throw new Error('Python 3 SVG validation is unavailable or timed out.');
    if (result.status !== 0) throw new Error(readFileSync(join(folder, 'error.txt'), 'utf8').trim());
    return JSON.parse(readFileSync(join(folder, 'output.json'), 'utf8'));
  } finally {
    handles.forEach(closeSync);
    rmSync(folder, { recursive: true, force: true });
  }
}
async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, path);
}
async function readJsonIfPresent(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

/** Resumes a saved task for the same reference; never replaces the running UI. */
export async function generateHeartAsset({ referencePath, outputDirectory, client = createFigureLabsClient(), signal = AbortSignal.timeout(720_000) }) {
  if (!client.configured) throw new Error('BLOCKER: add server-side FIGURELABS_API_KEY.');
  if (!referencePath || !outputDirectory) throw new Error('Reference bitmap and an isolated output directory are required.');
  const metadata = await stat(referencePath);
  if (!metadata.isFile() || metadata.size > 16 * 1024 * 1024) throw new Error('Reference must be a bitmap file no larger than 16 MiB.');
  const referenceSha256 = sha256(await readFile(referencePath));
  const taskPath = join(outputDirectory, 'task.json');
  let record = await readJsonIfPresent(taskPath);
  if (record && record.referenceSha256 !== referenceSha256) throw new Error('Output directory belongs to a different reference; choose another directory.');
  if (record && !record.taskId) throw new Error('Saved task record has no task ID; review it before creating another paid job.');
  if (!record) {
    const uploaded = await client.uploadLocalBitmap(referencePath, { signal });
    const submitted = await client.submitVectorization(uploaded.id, { signal });
    record = { taskId: submitted.task_id, sessionId: submitted.session_id, referenceSha256, createdAt: new Date().toISOString() };
    // Save before polling so an interrupted run can resume without another charge.
    await writeAtomic(taskPath, JSON.stringify(record, null, 2) + '\n');
  }
  const task = await client.waitForSvg(record.taskId, { signal });
  const svg = await client.downloadSvg(task, { signal });
  runSvgTool('validate', { svg });
  const inventory = runSvgTool('inventory', { svg });
  await writeAtomic(join(outputDirectory, 'heart-figurelabs-original.svg'), svg);
  await writeAtomic(join(outputDirectory, 'heart-inventory.svg'), inventory.svg);
  await writeAtomic(join(outputDirectory, 'node-inventory.json'), JSON.stringify(inventory.nodes, null, 2) + '\n');
  const provenance = {
    factory: 'FigureLabs', api: 'https://api.figurelabs.ai/v1/images/vectorize',
    ...record, rawSvgSha256: sha256(svg), scientificSources: SOURCES,
    scientificValidation: 'pending-geometry-review', semanticCleanup: 'pending-explicit-mapping',
  };
  await writeAtomic(join(outputDirectory, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
  return { taskId: record.taskId, rawSvgSha256: provenance.rawSvgSha256, outputDirectory };
}

export async function main(args = process.argv.slice(2)) {
  const [command, ...rest] = args;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--semantic') { options.semantic = true; continue; }
    if (!['--reference', '--out', '--svg', '--mapping'].includes(rest[i]) || !rest[i + 1] || rest[i + 1].startsWith('--')) throw new Error('Invalid argument. Use --reference/--out or --svg/--mapping/--out.');
    options[rest[i].slice(2)] = rest[++i];
  }
  if (command === 'generate') return generateHeartAsset({ referencePath: options.reference, outputDirectory: options.out });
  if (!['inventory', 'semanticize', 'validate'].includes(command) || !options.svg) throw new Error('Use generate --reference <bitmap> --out <directory>, inventory --svg <file> --out <file>, semanticize --svg <file> --mapping <json> --out <file>, or validate --svg <file> [--semantic].');
  const svg = await readFile(options.svg, 'utf8');
  if (command === 'validate') return runSvgTool(command, { svg, semantic: Boolean(options.semantic) });
  if (!options.out) throw new Error('--out is required.');
  if (resolve(options.svg) === resolve(options.out)) throw new Error('Output must differ from the immutable source SVG.');
  const mapping = command === 'semanticize' ? JSON.parse(await readFile(options.mapping, 'utf8')) : undefined;
  const result = runSvgTool(command, { svg, mapping });
  await writeAtomic(options.out, result.svg);
  if (result.nodes) await writeAtomic(`${options.out}.nodes.json`, JSON.stringify(result.nodes, null, 2) + '\n');
  return { output: options.out, ...(command === 'semanticize' ? runSvgTool('validate', { svg: result.svg, semantic: true }) : { nodes: result.nodes.length }) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(result => process.stdout.write(JSON.stringify(result, null, 2) + '\n')).catch(error => {
    process.stderr.write(`${error.code ? error.code + ': ' : ''}${error.message}\n`);
    process.exitCode = 1;
  });
}
