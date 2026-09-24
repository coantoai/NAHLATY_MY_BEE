// Server-only Lium API client. Never expose LIUM_API_KEY to browser code.
const BASE = process.env.LIUM_BASE_URL || "https://lium.io/api";

function key() {
  const value = process.env.LIUM_API_KEY;
  if (!value) throw new Error("LIUM_API_KEY is not configured");
  return value;
}

export async function lium(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "X-API-Key": key(),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    const err = new Error(body?.error?.message || body?.message || `Lium HTTP ${res.status}`);
    err.status = res.status;
    err.details = body;
    throw err;
  }
  return body;
}

export const getLiumAccount = () => lium("/users/me");
export const getLiumPods = () => lium("/pods");
export const getLiumExecutors = () => lium("/executors");
