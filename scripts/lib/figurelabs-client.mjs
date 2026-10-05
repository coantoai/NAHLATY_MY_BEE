import { readFile, stat } from "node:fs/promises";
import { basename } from "node:path";

const API_BASE = "https://api.figurelabs.ai";
const MAX_IMAGE_BYTES = 16 * 1024 * 1024;
const TASK_STATUSES = new Set(["pending", "processing", "succeeded", "failed", "rejected", "canceled"]);
const SVG_TYPES = new Set(["image/svg+xml", "svg"]);
const HTTP_CODES = new Set([
  "INVALID_API_KEY", "API_KEY_REVOKED", "API_KEY_DISABLED", "CUSTOMER_DISABLED",
  "MODEL_NOT_ALLOWED", "INSUFFICIENT_BALANCE", "BILLING_FAILED", "IDEMPOTENCY_KEY_CONFLICT",
  "RATE_LIMITED", "CONCURRENT_TASK_LIMIT_EXCEEDED", "INVALID_PROMPT", "MODEL_MODE_NOT_SUPPORTED",
  "STORAGE_QUOTA_EXCEEDED", "INTERNAL_ERROR", "1001011026", "1001011051", "1001011052",
  "1001011053", "1001011054", "1001011055", "1001011056", "1001011019",
]);

/** Public failures never include upstream messages, credentials, or signed URLs. */
export class FigureLabsError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "FigureLabsError";
    this.code = code;
    if (Number.isInteger(details.httpStatus)) this.httpStatus = details.httpStatus;
    if (details.requestId) this.requestId = details.requestId;
  }
}

const failure = (code, message, details) => new FigureLabsError(code, message, details);
function checkAbort(signal) {
  if (signal?.aborted) throw failure("ABORTED", "FigureLabs operation was canceled.");
}
function sleep(ms, { signal } = {}) {
  checkAbort(signal);
  return new Promise((resolve, reject) => {
    const onAbort = () => { clearTimeout(timer); reject(failure("ABORTED", "FigureLabs operation was canceled.")); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
function bitmapMime(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  throw failure("UNSUPPORTED_BITMAP", "Reference must be a PNG, JPEG, WebP, or GIF bitmap.");
}
function validateTaskId(taskId) {
  if (typeof taskId !== "string" || !/^tsk_[A-Za-z0-9_-]{1,160}$/.test(taskId)) {
    throw failure("INVALID_TASK_ID", "A valid FigureLabs task ID is required.");
  }
}
function validateSvgTask(task) {
  if (!SVG_TYPES.has(String(task?.output_type).toLowerCase())) {
    throw failure("INVALID_OUTPUT_TYPE", "FigureLabs must return an editable SVG asset.");
  }
  let url;
  try { url = new URL(task.output_url); } catch { throw failure("INVALID_OUTPUT_URL", "FigureLabs SVG output URL is unavailable."); }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw failure("INVALID_OUTPUT_URL", "FigureLabs SVG output URL must use HTTPS.");
  }
}
function validateSvgText(text) {
  const content = text.replace(/^\uFEFF/, "").replace(/^\s*<\?xml[^?]*\?>/i, "").replace(/<!--[^]*?-->/g, "").trim();
  if (!/^<svg(?:\s|>)/i.test(content) || !/<\/svg>\s*$/i.test(content) || /<(?:[\w.-]+:)?(?:image|feImage)\b/i.test(content) || /data\s*:\s*image\//i.test(content)) {
    throw failure("INVALID_SVG", "FigureLabs output must be vector SVG without embedded raster images.");
  }
}

/**
 * Server-only FigureLabs V1 transport. Inject fetch/sleep/clock for transport tests.
 * Contract: https://www.figurelabs.ai/api/docs
 */
export function createFigureLabsClient({
  apiKey = process.env.FIGURELABS_API_KEY,
  fetchImpl = globalThis.fetch,
  sleepImpl = sleep,
  nowImpl = Date.now,
} = {}) {
  const key = typeof apiKey === "string" ? apiKey.trim() : "";
  const configured = Boolean(key && !/\.\.\.|[<>]|^(?:YOUR_API_KEY|YOUR_KEY|REPLACE_ME)$/i.test(key));
  function requireCredentials() {
    if (!configured) throw failure("MISSING_CREDENTIALS", "Add a valid server-side FIGURELABS_API_KEY.");
  }
  async function request(url, init, { authenticated = true } = {}) {
    if (authenticated) requireCredentials();
    checkAbort(init.signal);
    const headers = new Headers(init.headers);
    if (authenticated) headers.set("Authorization", `Bearer ${key}`);
    let response;
    try {
      response = await fetchImpl(url, { ...init, headers, redirect: "error" });
      checkAbort(init.signal);
    } catch (error) {
      checkAbort(init.signal);
      if (error instanceof FigureLabsError) throw error;
      throw failure("NETWORK_ERROR", "FigureLabs transport failed.");
    }
    if (!response.ok) {
      let body;
      try { body = await response.json(); } catch { body = {}; }
      checkAbort(init.signal);
      const code = HTTP_CODES.has(body?.errorCode) ? body.errorCode : "HTTP_ERROR";
      const requestId = typeof body?.requestId === "string" && /^req_[A-Za-z0-9_-]{1,96}$/.test(body.requestId) && !body.requestId.includes(key) ? body.requestId : undefined;
      throw failure(code, "FigureLabs API request failed.", { httpStatus: response.status, requestId });
    }
    return response;
  }
  async function apiJson(path, init) {
    const response = await request(`${API_BASE}${path}`, init);
    let body;
    try { body = await response.json(); } catch {
      checkAbort(init.signal);
      throw failure("INVALID_RESPONSE", "FigureLabs returned an invalid API response.");
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw failure("INVALID_RESPONSE", "FigureLabs returned an invalid API response.");
    return body;
  }
  async function uploadLocalBitmap(filePath, { signal } = {}) {
    requireCredentials();
    checkAbort(signal);
    let metadata, bytes;
    try {
      metadata = await stat(filePath);
      if (!metadata.isFile()) throw failure("INPUT_FILE_UNAVAILABLE", "Reference bitmap file is unavailable.");
      if (metadata.size > MAX_IMAGE_BYTES) throw failure("IMAGE_TOO_LARGE", "Reference bitmap exceeds the 16 MiB FigureLabs limit.");
      bytes = await readFile(filePath, { signal });
    } catch (error) {
      checkAbort(signal);
      if (error instanceof FigureLabsError) throw error;
      throw failure("INPUT_FILE_UNAVAILABLE", "Reference bitmap file is unavailable.");
    }
    if (bytes.length > MAX_IMAGE_BYTES) throw failure("IMAGE_TOO_LARGE", "Reference bitmap exceeds the 16 MiB FigureLabs limit.");
    const mime = bitmapMime(bytes);
    const body = new FormData();
    body.append("file", new Blob([bytes], { type: mime }), basename(filePath));
    body.append("purpose", "image_generation");
    const uploaded = await apiJson("/v1/files", { method: "POST", body, signal });
    if (typeof uploaded.id !== "string" || !uploaded.id) throw failure("INVALID_RESPONSE", "FigureLabs upload returned no file ID.");
    return uploaded;
  }
  async function submitVectorization(imageUrl, { signal } = {}) {
    requireCredentials();
    checkAbort(signal);
    if (typeof imageUrl !== "string" || !imageUrl.trim()) throw failure("INVALID_REFERENCE", "One reference bitmap URL, data URI, or file ID is required.");
    const task = await apiJson("/v1/images/vectorize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: imageUrl }), signal });
    if (typeof task.task_id !== "string" || !TASK_STATUSES.has(task.status)) throw failure("INVALID_RESPONSE", "FigureLabs returned no valid task.");
    validateTaskId(task.task_id);
    return task;
  }
  async function getTask(taskId, { signal } = {}) {
    requireCredentials();
    checkAbort(signal);
    validateTaskId(taskId);
    const task = await apiJson(`/v1/tasks/${taskId}`, { method: "GET", signal });
    if (!TASK_STATUSES.has(task.status)) throw failure("INVALID_RESPONSE", "FigureLabs returned an unknown task status.");
    return task;
  }
  async function waitForSvg(taskId, { signal, timeoutMs = 600_000, pollIntervalMs = 3000 } = {}) {
    requireCredentials();
    checkAbort(signal);
    validateTaskId(taskId);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isFinite(pollIntervalMs) || pollIntervalMs < 2000 || pollIntervalMs > 5000) {
      throw failure("INVALID_POLL_OPTIONS", "Use a positive timeout and a 2–5 second polling interval.");
    }
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), timeoutMs);
    const activeSignal = signal ? AbortSignal.any([signal, deadline.signal]) : deadline.signal;
    const expiresAt = nowImpl() + timeoutMs;
    try {
      while (true) {
        checkAbort(activeSignal);
        if (nowImpl() >= expiresAt) throw failure("POLL_TIMEOUT", "FigureLabs SVG task exceeded its timeout.");
        const task = await getTask(taskId, { signal: activeSignal });
        if (task.status === "succeeded") { validateSvgTask(task); return task; }
        if (task.status === "failed") throw failure("TASK_FAILED", "FigureLabs SVG task failed.");
        if (task.status === "rejected") throw failure("TASK_REJECTED", "FigureLabs SVG task was rejected.");
        if (task.status === "canceled") throw failure("TASK_CANCELED", "FigureLabs SVG task was canceled.");
        await sleepImpl(Math.min(pollIntervalMs, Math.max(0, expiresAt - nowImpl())), { signal: activeSignal });
      }
    } catch (error) {
      if (signal?.aborted) throw failure("ABORTED", "FigureLabs operation was canceled.");
      if (deadline.signal.aborted || nowImpl() >= expiresAt) throw failure("POLL_TIMEOUT", "FigureLabs SVG task exceeded its timeout.");
      throw error;
    } finally { clearTimeout(timer); }
  }
  async function downloadSvg(task, { signal } = {}) {
    checkAbort(signal);
    validateSvgTask(task);
    const response = await request(task.output_url, { method: "GET", signal }, { authenticated: false });
    const mime = response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
    if (mime && !["image/svg+xml", "application/xml", "text/xml", "text/plain", "application/octet-stream"].includes(mime)) {
      throw failure("INVALID_OUTPUT_TYPE", "FigureLabs download is not an SVG asset.");
    }
    let text;
    try { text = await response.text(); } catch {
      checkAbort(signal);
      throw failure("NETWORK_ERROR", "FigureLabs SVG download failed.");
    }
    checkAbort(signal);
    validateSvgText(text);
    return text;
  }
  return Object.freeze({ configured, uploadLocalBitmap, submitVectorization, getTask, waitForSvg, downloadSvg });
}
