import { chromium } from "playwright";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const OUT = "research/factory-tests/out";
await fs.mkdir(OUT, { recursive: true });
const result = {
  audited_at: new Date().toISOString(),
  source: "heliosv24/v8-engine",
  mode: "isolated CPU software-rendered browser; no inference or API key",
  v8: { tested: false, errors: [] },
  scenecode: { tested: false, errors: [] }
};
const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-dev-shm-usage",
      "--enable-webgl",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-swiftshader"
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on("pageerror", (err) => result.v8.errors.push(String(err).slice(0, 500)));
  await page.goto("http://127.0.0.1:8765", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForFunction(() => typeof window.V8?.setView === "function", null, { timeout: 60000 });
  result.v8.tested = true;
  result.v8.public_api = await page.evaluate(() => ({
    methods: Object.keys(window.V8 || {}),
    canvas_count: document.querySelectorAll("canvas").length,
    title: document.title
  }));
  const full = await page.screenshot({ path: OUT + "/v8-full.png", animations: "disabled" });
  result.v8.full_sha256 = sha256(full);
  await page.evaluate(() => { window.V8.setCrank(370); window.V8.setView("exploded"); });
  await page.waitForTimeout(1800);
  const exploded = await page.screenshot({ path: OUT + "/v8-exploded.png", animations: "disabled" });
  result.v8.exploded_sha256 = sha256(exploded);
  result.v8.visual_change = result.v8.full_sha256 !== result.v8.exploded_sha256;
  await page.evaluate(() => { window.V8.setView("cutaway"); });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + "/v8-cutaway.png", animations: "disabled" });
  try {
    const selfTest = await page.evaluate(() => window.V8.runSelfTest?.());
    result.v8.self_test_result = selfTest ?? "called; function returned undefined";
  } catch (e) { result.v8.errors.push("self-test " + String(e)); }

  const page2 = await context.newPage();
  page2.on("pageerror", (err) => result.scenecode.errors.push(String(err).slice(0, 500)));
  await page2.goto("https://scene-code.github.io/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page2.waitForTimeout(10000);
  result.scenecode.tested = true;
  result.scenecode.viewer = await page2.evaluate(() => ({
    title: document.title,
    canvas_count: document.querySelectorAll("canvas").length,
    select_count: document.querySelectorAll("select").length,
    body_contains_object_code: document.body.innerText.includes("Part-Level Code")
  }));
  await page2.screenshot({ path: OUT + "/scenecode-page.png", animations: "disabled" });
  const canvas = page2.locator("canvas").first();
  if (await canvas.count()) {
    const box = await canvas.boundingBox();
    if (box) {
      await page2.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page2.mouse.down();
      await page2.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2 + 30, { steps: 12 });
      await page2.mouse.up();
      await page2.waitForTimeout(900);
      await page2.screenshot({ path: OUT + "/scenecode-rotated.png", animations: "disabled" });
      result.scenecode.drag_exercised = true;
    }
  }
  await context.close();
} catch (e) {
  result.error = String(e);
} finally {
  if (browser) await browser.close();
  await fs.writeFile(OUT + "/audit.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
}
