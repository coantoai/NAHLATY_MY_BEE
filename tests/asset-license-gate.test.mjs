import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAssetLicense, LICENSE_TIER } from "../app/lib/assets/licenseGate.js";

test("accepts public-domain asset with commercial derivatives and redistribution", () => {
  const result = evaluateAssetLicense({
    licenseId: "public-domain",
    commercialUse: true,
    derivatives: true,
    redistribution: true,
    attributionRequired: false
  });
  assert.equal(result.tier, LICENSE_TIER.CORE);
  assert.equal(result.acceptedForCore, true);
});

test("accepts CC0 asset into core", () => {
  const result = evaluateAssetLicense({
    licenseId: "cc0-1.0",
    commercialUse: true,
    derivatives: true,
    redistribution: true,
    attributionRequired: false
  });
  assert.equal(result.tier, LICENSE_TIER.CORE);
});

test("keeps attribution licenses out of no-attribution core", () => {
  const result = evaluateAssetLicense({
    licenseId: "cc-by-4.0",
    commercialUse: true,
    derivatives: true,
    redistribution: true,
    attributionRequired: true
  });
  assert.equal(result.tier, LICENSE_TIER.ATTRIBUTION);
  assert.equal(result.acceptedForCore, false);
});

test("rejects NC, ND, SA, or extra-agreement assets from core", () => {
  for (const restriction of ["nonCommercial", "noDerivatives", "shareAlike", "extraAgreement"]) {
    const result = evaluateAssetLicense({
      licenseId: "custom",
      commercialUse: true,
      derivatives: true,
      redistribution: true,
      [restriction]: true
    });
    assert.equal(result.tier, LICENSE_TIER.REJECT);
  }
});
