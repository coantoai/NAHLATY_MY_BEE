// Optional browser QA; Playwright is tooling, not an application dependency.
// See docs/engine/ZZ4_VALIDATION.md for installation and startup instructions.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function auditBrowser() {
  const output = process.env.ZZ4_QA_OUTPUT_DIR || '/tmp/zz4-browser-qa';
  const baseUrl = process.env.ZZ4_BASE_URL || 'http://127.0.0.1:3000';
  await fs.mkdir(output, { recursive: true });
  const results = [];
  for (const config of [
    { name: 'desktop', width: 1440, height: 1100 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'webgl-disabled', width: 1440, height: 1100, disabled: true },
  ]) {
    const browser = await chromium.launch({
      executablePath: process.env.ZZ4_BROWSER_PATH || undefined,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...(config.disabled ? ['--disable-webgl'] : [])],
    });
    try {
      const page = await browser.newPage({ viewport: { width: config.width, height: config.height } });
      const exceptions = [];
      page.on('pageerror', error => exceptions.push(error.message));
      const response = await page.goto(new URL('/engine-benchmark', baseUrl).href, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, 'benchmark route must load');
      const angle = async () => parseFloat(await page.locator('div[class*="telemetry"] strong').first().textContent());
      const result = { name: config.name, exceptions, controls: {} };
      if (config.disabled) {
        await page.getByRole('status').waitFor();
        assert.match(await page.getByRole('status').textContent(), /WebGL/);
        assert.equal(await page.locator('button:disabled').count(), 5);
        result.fallback = 'PASS';
      } else {
        await page.waitForFunction(() => document.querySelector('canvas') && [...document.querySelectorAll('button')].every(button => !button.disabled));
        assert.equal(await page.locator('canvas').count(), 1);
        for (const name of ['تركيز المكبس', 'عزل المكبس', 'إيقاف']) {
          await page.getByRole('button', { name: 'تشغيل الدورة', exact: true }).click();
          await page.waitForTimeout(250);
          await page.getByRole('button', { name, exact: true }).click();
          await page.waitForTimeout(150);
          const frozen = await angle();
          assert.ok(Number.isFinite(frozen), 'angle readout must be numeric');
          await page.waitForTimeout(350);
          assert.equal(await angle(), frozen, name + ' must preserve the current phase');
          result.controls[name] = { status: 'PASS', frozenAngle: frozen };
        }
        await page.getByRole('button', { name: '↻ إعادة من البداية', exact: true }).click();
        await page.getByRole('button', { name: 'إيقاف', exact: true }).click();
        const replayAngle = await angle();
        assert.ok(replayAngle < 90, 'replay must restart near zero');
        await page.getByRole('button', { name: 'تشغيل الدورة', exact: true }).click();
        await page.waitForTimeout(400);
        await page.getByRole('button', { name: 'إيقاف', exact: true }).click();
        assert.notEqual(await angle(), replayAngle, 'resume must advance the angle');
        result.controls.replayAndResume = 'PASS';
        const focus = page.getByRole('button', { name: 'تركيز المكبس', exact: true });
        await focus.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);
        assert.equal(await focus.getAttribute('aria-pressed'), 'true');
        result.controls.keyboard = 'PASS';
        await page.getByRole('button', { name: 'إيقاف', exact: true }).click();
      }
      assert.equal(exceptions.length, 0, 'no uncaught browser exceptions');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, 'no horizontal overflow');
      result.horizontalOverflow = false;
      await page.screenshot({ path: path.join(output, `zz4-${config.name}.png`), fullPage: true });
      results.push(result);
    } finally {
      await browser.close();
    }
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results));
}

auditBrowser().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
