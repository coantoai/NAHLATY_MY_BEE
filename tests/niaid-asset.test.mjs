import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const svg = readFileSync(new URL("../public/heart-vector/niaid-heart.svg", import.meta.url), "utf8");
const provenance = JSON.parse(readFileSync(new URL("../public/heart-vector/niaid-heart.provenance.json", import.meta.url), "utf8"));

test("bundled NIAID heart contains native geometry and no embedded raster", () => {
  assert.match(svg, /<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /id="heart-root"/);
  assert.doesNotMatch(svg, /<(?:\w+:)?(?:image|foreignObject|script)\b|data:image\//i);
  assert.doesNotMatch(svg, /(?:href|src)="https?:\/\//i);
  assert.equal((svg.match(/data-source-kind="anatomy-path"/g) || []).length, 45);
  assert.equal((svg.match(/data-vectorized-mask="luminance"/g) || []).length, 28);
  assert.equal(provenance.originalPathCount, 45);
  assert.equal(provenance.vectorizedMaskCount, 28);
});

test("original paths have stable independent IDs and honest provenance", () => {
  const ids = Array.from(svg.matchAll(/\bid="([^"]+)"/g), m => m[1]);
  assert.equal(new Set(ids).size, ids.length, "all SVG IDs are unique");
  for (const path of provenance.anatomyPaths) {
    assert.ok(ids.includes(path.elementId), path.elementId);
    assert.match(path.pathSha256, /^[a-f0-9]{64}$/);
  }
  for (const group of ["top_vessels", "bottom_vessels", "left_vessels"]) assert.ok(ids.includes(group));
  assert.equal(provenance.svgSha256, createHash("sha256").update(svg).digest("hex"));
  assert.equal(provenance.license, "Public Domain");
  assert.equal(provenance.credit, "Courtesy of NIAID");
  assert.equal(provenance.sourceUrl, "https://bioart.niaid.nih.gov/api/bioarts/228/files/630873");
  assert.match(provenance.approximationDisclosure, /shading masks/);
  assert.equal(provenance.semanticReady, false, "asset conversion alone does not certify clinical semantic bindings");
});
