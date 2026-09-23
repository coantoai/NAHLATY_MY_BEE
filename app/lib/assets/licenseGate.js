export const LICENSE_TIER = Object.freeze({
  CORE: "A",
  ATTRIBUTION: "B",
  REJECT: "C"
});

const CORE_LICENSES = new Set([
  "public-domain",
  "cc0-1.0"
]);

export function evaluateAssetLicense(input = {}) {
  const {
    licenseId = "unknown",
    commercialUse = false,
    derivatives = false,
    redistribution = false,
    attributionRequired = false,
    shareAlike = false,
    nonCommercial = false,
    noDerivatives = false,
    extraAgreement = false
  } = input;

  if (
    nonCommercial ||
    noDerivatives ||
    shareAlike ||
    extraAgreement ||
    !commercialUse ||
    !derivatives ||
    !redistribution
  ) {
    return Object.freeze({
      tier: LICENSE_TIER.REJECT,
      acceptedForCore: false,
      reason: "License does not satisfy commercial derivative redistribution requirements."
    });
  }

  if (CORE_LICENSES.has(String(licenseId).toLowerCase()) && !attributionRequired) {
    return Object.freeze({
      tier: LICENSE_TIER.CORE,
      acceptedForCore: true,
      reason: "Unrestricted core-library license with no mandatory attribution."
    });
  }

  return Object.freeze({
    tier: LICENSE_TIER.ATTRIBUTION,
    acceptedForCore: false,
    reason: attributionRequired
      ? "Commercial use is possible, but attribution is mandatory."
      : "Commercial use may be possible, but this license is not in the no-attribution core allowlist."
  });
}

export function assertCoreAssetLicense(input = {}) {
  const result = evaluateAssetLicense(input);
  if (!result.acceptedForCore) {
    throw new Error(`Asset rejected from core library: ${result.reason}`);
  }
  return result;
}
