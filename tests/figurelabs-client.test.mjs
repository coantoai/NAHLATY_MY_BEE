import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const moduleUrl = new URL("../scripts/lib/figurelabs-client.mjs", import.meta.url);
const exports = existsSync(moduleUrl) ? await import(moduleUrl) : {};
const apiKey = "fl_live_test_transport_only";
const apiBase = "https://api.figurelabs.ai";
const svgTask = { task_id: "tsk_heart", status: "succeeded", output_url: "https://files.figurelabs.ai/presigned/heart.svg?signature=private", output_type: "image/svg+xml" };
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const makeClient = (options = {}) => {
  assert.equal(typeof exports.createFigureLabsClient, "function", "FigureLabs client factory must exist");
  return exports.createFigureLabsClient({ apiKey, ...options });
};
async function withBitmap(t, bytes, run, name = "reference.png") {
  const dir = await mkdtemp(join(tmpdir(), "figurelabs-client-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, name);
  await writeFile(path, bytes);
  return run(path);
}
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);

// Removing the public factory must make this contract fail.
test("exports a server-side client factory", () => {
  assert.equal(typeof exports.createFigureLabsClient, "function");
});

// Falling back to a fake credential would perform an unauthorized request.
test("missing credentials block upload, submission, and task reads before transport", async () => {
  const client = makeClient({ apiKey: "", fetchImpl: () => assert.fail("credentials must gate transport") });
  assert.equal(client.configured, false);
  for (const operation of [() => client.uploadLocalBitmap("missing.png"), () => client.submitVectorization("https://example.org/heart.png"), () => client.getTask("tsk_heart")]) {
    await assert.rejects(operation, { code: "MISSING_CREDENTIALS" });
  }
});

test("obvious placeholder keys cannot authorize tasks", async () => {
  for (const key of ["fl_live_...", "YOUR_API_KEY", "<FIGURELABS_API_KEY>"]) {
    const client = makeClient({ apiKey: key, fetchImpl: () => assert.fail("placeholder must gate transport") });
    await assert.rejects(() => client.submitVectorization("file_heart"), { code: "MISSING_CREDENTIALS" });
  }
});

// Renaming image_url or changing the official endpoint breaks API compatibility.
test("submits one reference image to the documented vectorize endpoint", async () => {
  const accepted = { task_id: "tsk_heart", session_id: "ses_heart", status: "processing", estimated_price: 50, currency: "USD" };
  const client = makeClient({ fetchImpl: async (url, init) => {
    assert.equal(url, `${apiBase}/v1/images/vectorize`);
    assert.equal(init.method, "POST");
    assert.equal(new Headers(init.headers).get("Authorization"), `Bearer ${apiKey}`);
    assert.deepEqual(JSON.parse(init.body), { image_url: "file_heart" });
    return json(accepted, 202);
  } });
  assert.deepEqual(await client.submitVectorization("file_heart"), accepted);
});

// Uploading a filename instead of its bytes would leave vectorization without a source.
test("uploads local PNG bytes with MIME and image_generation purpose", async (t) => {
  const client = makeClient({ fetchImpl: async (url, init) => {
    assert.equal(url, `${apiBase}/v1/files`);
    assert.equal(new Headers(init.headers).get("Content-Type"), null, "fetch must generate the multipart boundary");
    assert.equal(new Headers(init.headers).get("Authorization"), `Bearer ${apiKey}`);
    assert.equal(init.body.get("purpose"), "image_generation");
    const file = init.body.get("file");
    assert.equal(file.name, "reference.png");
    assert.equal(file.type, "image/png");
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), png);
    return json({ id: "file_heart", mime_type: "image/png" }, 201);
  } });
  await withBitmap(t, png, async (path) => assert.equal((await client.uploadLocalBitmap(path)).id, "file_heart"));
});

// Trusting extensions permits HTML/SVG payloads to masquerade as bitmap uploads.
test("rejects unsupported bitmap content even with a PNG extension", async (t) => {
  const client = makeClient({ fetchImpl: () => assert.fail("invalid bytes must stay local") });
  await withBitmap(t, Buffer.from("<svg><script/></svg>"), async (path) => {
    await assert.rejects(() => client.uploadLocalBitmap(path), { code: "UNSUPPORTED_BITMAP" });
  });
});

test("rejects local bitmaps above the documented 16 MiB limit", async (t) => {
  const bytes = Buffer.alloc(16 * 1024 * 1024 + 1); png.copy(bytes);
  const client = makeClient({ fetchImpl: () => assert.fail("oversized upload must stay local") });
  await withBitmap(t, bytes, async (path) => {
    await assert.rejects(() => client.uploadLocalBitmap(path), { code: "IMAGE_TOO_LARGE" });
  });
});

// Interpolating arbitrary task IDs into paths could select a different endpoint.
test("rejects task IDs containing path traversal", async () => {
  const client = makeClient({ fetchImpl: () => assert.fail("invalid ID must not reach transport") });
  await assert.rejects(() => client.getTask("tsk_heart/../../files"), { code: "INVALID_TASK_ID" });
});

test("reads task status from the documented authenticated task endpoint", async () => {
  const client = makeClient({ fetchImpl: async (url, init) => {
    assert.equal(url, `${apiBase}/v1/tasks/tsk_heart`);
    assert.equal(init.method, "GET");
    assert.equal(new Headers(init.headers).get("Authorization"), `Bearer ${apiKey}`);
    return json(svgTask);
  } });
  assert.deepEqual(await client.getTask("tsk_heart"), svgTask);
});

// Returning processing as a finished asset would break downstream semantic cleanup.
test("polls pending and processing tasks until an SVG succeeds", async () => {
  const queue = [{ status: "pending" }, { status: "processing" }, svgTask];
  const intervals = [];
  const client = makeClient({ fetchImpl: async () => json(queue.shift()), sleepImpl: async (ms) => intervals.push(ms) });
  assert.deepEqual(await client.waitForSvg("tsk_heart", { pollIntervalMs: 2000 }), svgTask);
  assert.deepEqual(intervals, [2000, 2000]);
});

test("failed, rejected, and canceled tasks terminate without another poll", async () => {
  for (const status of ["failed", "rejected", "canceled"]) {
    const client = makeClient({ fetchImpl: async () => json({ status, error: { code: "UPSTREAM_FAILED", message: `${apiKey} secret` } }), sleepImpl: () => assert.fail("terminal states must stop") });
    await assert.rejects(() => client.waitForSvg("tsk_heart"), (error) => {
      assert.equal(error.code, status === "canceled" ? "TASK_CANCELED" : status === "rejected" ? "TASK_REJECTED" : "TASK_FAILED");
      assert.equal(error.message.includes(apiKey), false);
      return true;
    });
  }
});

test("rejects a succeeded raster task before download", async () => {
  const client = makeClient({ fetchImpl: async () => json({ ...svgTask, output_type: "image/png" }) });
  await assert.rejects(() => client.waitForSvg("tsk_heart"), { code: "INVALID_OUTPUT_TYPE" });
});

test("polling timeout stops processing tasks", async () => {
  let now = 0;
  const client = makeClient({ nowImpl: () => now, fetchImpl: async () => json({ status: "processing" }), sleepImpl: async (ms) => { now += ms; } });
  await assert.rejects(() => client.waitForSvg("tsk_heart", { timeoutMs: 5000, pollIntervalMs: 2000 }), { code: "POLL_TIMEOUT" });
});

test("a timeout also aborts a task read that never completes", async () => {
  const client = makeClient({ fetchImpl: async (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true })) });
  await assert.rejects(() => client.waitForSvg("tsk_heart", { timeoutMs: 10 }), { code: "POLL_TIMEOUT" });
});

test("an already aborted signal performs no authenticated request", async () => {
  const client = makeClient({ fetchImpl: () => assert.fail("aborted work must not fetch") });
  const signal = AbortSignal.abort();
  await assert.rejects(() => client.waitForSvg("tsk_heart", { signal }), { code: "ABORTED" });
});

test("caller cancellation interrupts active polling", async () => {
  const controller = new AbortController();
  const client = makeClient({ fetchImpl: async (_url, init) => {
    controller.abort();
    throw new DOMException("secret transport exception", "AbortError");
  } });
  await assert.rejects(() => client.waitForSvg("tsk_heart", { signal: controller.signal }), { code: "ABORTED" });
});

// Sending bearer authorization to a signed storage URL leaks the API secret.
test("downloads a signed SVG without API authorization", async () => {
  const client = makeClient({ fetchImpl: async (url, init) => {
    assert.equal(url, svgTask.output_url);
    assert.equal(new Headers(init.headers).get("Authorization"), null);
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  } });
  assert.equal(await client.downloadSvg(svgTask), svg);
});

test("rejects non-HTTPS output links before download", async () => {
  const client = makeClient({ fetchImpl: () => assert.fail("unsafe link must not fetch") });
  await assert.rejects(() => client.downloadSvg({ ...svgTask, output_url: "http://files.figurelabs.ai/heart.svg" }), { code: "INVALID_OUTPUT_URL" });
});

// Accepting PNG bytes or an embedded image would produce a flattened asset.
test("rejects downloaded raster bodies and SVGs containing embedded images", async () => {
  for (const body of ["PNG bytes", '<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,AAAA"/></svg>', '<svg><feImage href="https://example.org/heart.png"/></svg>']) {
    const client = makeClient({ fetchImpl: async () => new Response(body, { headers: { "Content-Type": "image/svg+xml" } }) });
    await assert.rejects(() => client.downloadSvg(svgTask), { code: "INVALID_SVG" });
  }
});

test("rejects raster download content types even if body looks like SVG", async () => {
  const client = makeClient({ fetchImpl: async () => new Response(svg, { headers: { "Content-Type": "image/png" } }) });
  await assert.rejects(() => client.downloadSvg(svgTask), { code: "INVALID_OUTPUT_TYPE" });
});

test("HTTP errors expose safe codes without credentials, signed URLs, or upstream messages", async () => {
  const client = makeClient({ fetchImpl: async () => json({ errorCode: "INVALID_API_KEY", message: `${apiKey} ${svgTask.output_url}`, requestId: "req_heart" }, 401) });
  await assert.rejects(() => client.submitVectorization("file_heart"), (error) => {
    assert.equal(error.code, "INVALID_API_KEY");
    assert.equal(error.httpStatus, 401);
    assert.equal(error.requestId, "req_heart");
    assert.equal(JSON.stringify(error).includes(apiKey), false);
    assert.equal(error.message.includes(svgTask.output_url), false);
    return true;
  });
});

test("network errors and malformed API responses become structured sanitized errors", async () => {
  const client = makeClient({ fetchImpl: async () => { throw new Error(`transport ${apiKey}`); } });
  await assert.rejects(() => client.getTask("tsk_heart"), (error) => error.code === "NETWORK_ERROR" && !error.message.includes(apiKey));
  const invalid = makeClient({ fetchImpl: async () => new Response("not json") });
  await assert.rejects(() => invalid.getTask("tsk_heart"), { code: "INVALID_RESPONSE" });
});
