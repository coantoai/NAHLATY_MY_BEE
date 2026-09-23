import { evaluateAssetLicense } from "../licenseGate";
import { SMART_HEART_REQUIREMENTS } from "./heartRequirements";

export const IJIRI_HEART_V4 = Object.freeze({
  id: "ijiri-heart-v4",
  title: "Takashi Ijiri Full Heart Model v4",
  domain: "anatomy",
  organ: "heart",
  role: "public-domain-reference-and-motion-base",
  status: "geometry-inspected-not-master-ready",
  masterCandidate: false,
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
      "Public-domain statement applies to the heart models. The bundled simulator is demonstration-only and must not be redistributed."
  }),
  acquiredModelFiles: Object.freeze([
    "version4.blend",
    "version4Mesh.obj",
    "version4Mesh_lap1_col3000.obj",
    "version4Mesh_lap1_col3000_manu.off"
  ]),
  provenance: Object.freeze({
    modeledBy: "Takashi Ijiri",
    constructionNote:
      "Surface model was modeled in Blender using a full-heart MRI-based model as a guide and anatomy textbooks as references.",
    citationRequired: false
  }),
  inspection: Object.freeze({
    binaryInspected: true,
    sourceIntegrityVerified: true,
    highResolutionObj: Object.freeze({
      vertices: 7500,
      faces: 15016,
      objects: 1,
      groups: 0,
      uvCoordinates: 0,
      vertexNormals: 0,
      materials: 1
    }),
    semanticPartInventoryComplete: false,
    topologyChecked: false,
    internalStructuresChecked: false,
    webConversionChecked: false,
    finding:
      "The exported OBJ is a single undivided surface mesh. It is legally excellent but not sufficient by itself for deep semantic heart exploration."
  }),
  decision: Object.freeze({
    useFor: Object.freeze([
      "public-domain geometry reference",
      "heartbeat/deformation research reference",
      "comparison and validation"
    ]),
    doNotUseFor: Object.freeze([
      "final master Smart Heart without re-segmentation",
      "deep chamber/valve navigation as-is"
    ]),
    nextRequirement:
      "Find or derive a higher-detail CC0/Public-Domain segmented heart source before wiring the production heart renderer."
  }),
  benchmark: SMART_HEART_REQUIREMENTS.benchmark
});

export const IJIRI_HEART_LICENSE_RESULT = evaluateAssetLicense(IJIRI_HEART_V4.license);
