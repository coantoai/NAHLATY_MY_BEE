import { evaluateAssetLicense } from "../licenseGate";
import { SMART_HEART_REQUIREMENTS } from "./heartRequirements";

export const IJIRI_HEART_V4 = Object.freeze({
  id: "ijiri-heart-v4",
  title: "Takashi Ijiri Full Heart Model v4",
  domain: "anatomy",
  organ: "heart",
  status: "source-approved-binary-inspection-pending",
  source: Object.freeze({
    projectUrl: "https://takashiijiri.com/projects/ProjHeartSim/index.html",
    repository: "TakashiIjiri/TakashiIjiri.github.io",
    archivePath: "projects/ProjHeartSim/HeartSim20150114_v4.zip",
    archiveBlobSha: "21471b533398d1804dc7c58d46537de986773149",
    archiveSizeBytes: 11311761
  }),
  license: Object.freeze({
    licenseId: "public-domain",
    commercialUse: true,
    derivatives: true,
    redistribution: true,
    attributionRequired: false,
    shareAlike: false,
    nonCommercial: false,
    noDerivatives: false,
    extraAgreement: false,
    scopeNote:
      "Public-domain statement applies to heart models in ./HeartModel. The bundled simulator is demonstration-only and must not be redistributed."
  }),
  expectedModelFiles: Object.freeze([
    "HeartModel/version4.blend",
    "HeartModel/version4Mesh.obj",
    "HeartModel/version4Mesh_lap1_col3000.obj",
    "HeartModel/version4Mesh_lap1_col3000_manu.off",
    "HeartModel/Model_A.ele",
    "HeartModel/Model_A.node"
  ]),
  provenance: Object.freeze({
    modeledBy: "Takashi Ijiri",
    constructionNote:
      "Surface model was modeled in Blender using a full-heart MRI-based model as a guide and anatomy textbooks as references.",
    citationRequired: false
  }),
  inspection: Object.freeze({
    binaryInspected: false,
    semanticPartInventoryComplete: false,
    topologyChecked: false,
    normalsChecked: false,
    internalStructuresChecked: false,
    webConversionChecked: false
  }),
  benchmark: SMART_HEART_REQUIREMENTS.benchmark
});

export const IJIRI_HEART_LICENSE_RESULT = evaluateAssetLicense(IJIRI_HEART_V4.license);
