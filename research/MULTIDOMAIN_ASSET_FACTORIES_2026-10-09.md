# NAHLATY — Multi-Domain Asset Factory Research (2026-10-09)

Scope: asset manufacture ONLY. NAHLATY retains responsibility for educational explanation, interpretation, interaction and existing runtime. This is research; no runtime changes.

## Decision
Choose a federation of domain-specific asset factories plus a common asset manifest and conversion pipeline, not a single monolithic model. Separate GENERATIVE MODELS (image->mesh), PROCEDURAL GENERATORS (parameter->geometry), DATA->GEOMETRY TRANSFORMS (scientific data->validated assets), and INDUSTRIAL ORCHESTRATION (batch, labels, conversions).

## Promising verified-source leads (capability descriptions from original documentation, NOT integrated tests)

| Domain / purpose | Technology | Code | Claim | License / constraints | Status |
|---|---|---|---|---|---|
| General image->3D | Microsoft TRELLIS.2 | https://github.com/microsoft/TRELLIS.2 | Image-conditioned PBR 3D meshes, training/inference code; 24GB+ NVIDIA GPU stated | MIT code/model; third-party NVIDIA rendering libs license must be reviewed | Source inspected, no inference run |
| Mechanical/engineering | CadQuery | https://github.com/CadQuery/cadquery | Headless Python parametric CAD, complex assemblies, STEP/STL etc | Apache-2.0 | Source inspected, no CAD run |
| Mechanical/engineering | build123d | https://github.com/gumyr/build123d | Headless Python CAD; structured components | Apache-2.0 | Source inspected, no CAD run |
| Plants | OpenAlea L-Py + PlantGL | https://github.com/openalea/lpy ; https://github.com/openalea/plantgl | Procedural L-system growth and plant geometry | L-Py CeCILL (GPL-compatible); other packages may differ | Docs inspected, no generation run |
| Geography/cities | OSM2World | https://github.com/tordanik/OSM2World | OSM->3D, GLB/glTF/OBJ exports, CLI | LGPL code; OSM ODbL data/attribution obligations | Source reviewed, no live run |
| Structural biology | MolecularNodes | https://github.com/BradyAJohnston/MolecularNodes | Blender protein/MD/cryoET import and geometry-nodes animation | GPL-3.0; Blender-side tool | Source reviewed, no live run |
| Chemistry | RDKit + trimesh | https://github.com/rdkit/rdkit ; https://github.com/mikedh/trimesh | SMILES->3D atomic coordinates->independent named atom/bond GLB nodes | RDKit BSD-3; trimesh MIT | **Local smoke test actually completed** |
| Industrial synthesis | BlenderProc | https://github.com/DLR-RM/BlenderProc | Blender procedural scene/material/collision/semantic annotation | Check repository license before commercial deployment | Docs reviewed, no run |
| Physics + annotations | Kubric | https://github.com/google-research/kubric | Blender/PyBullet pipeline for annotated physically simulated 3D object scenes | Verify dependencies and old Blender constraints | Docs reviewed, no run |
| Neuroanatomical data->mesh | BrainGlobe atlasapi | https://github.com/brainglobe/brainglobe-atlasapi | Download brain structures with named mesh files | Per-atlas data licenses must be verified | Docs reviewed, no download |
| Electronics models | KiCad 3D models | https://gitlab.com/kicad/libraries/kicad-packages3D | 3D electronic components with manufacturer-style geometry | CC BY-SA with special downstream design exception; library redistribution constrained | License reviewed |
| Space | NASA 3D Resources | https://science.nasa.gov/3d-resources/ | Downloadable mission/planet assets, including GLB | NASA media rules, no blanket rights claim | Documentation reviewed |

## Actually executed smoke test (isolated local environment)
Using installed RDKit 2025.09.4 + trimesh 4.11.1, generated water, ethanol, caffeine, aspirin from SMILES with ETKDG/force-field geometry, independent named atom and bond geometries and JSON semantic manifests. Exported all four to GLB. Reimport verification found 5/17/49/42 named nodes respectively, totaling 113 named nodes. These are illustration-quality conformers, not experimentally validated structures; no scientific or frontend semantic scene approval.

Archive produced: NAHLATY_Asset_Factory_Smoke_Test.zip in the chat working artifacts; not uploaded to production repository.

## Required common AssetSpec (proposal)
asset_id, canonical_subject_id, concept_family, source/provenance, per-component-license, semantic_nodes[], hierarchy, transforms, animation_channels, physical_units, geometry format (.glb/.usd/.svg), validation, unique-concept-key, file/hash/perceptual dedup, estimated render/generate costs.

## Stop/go test
One new asset each for chemistry, mechanics, and botany. For every output: exports/reimports, independent named parts, reasonable scientific fidelity, rights, pipeline time, file size, and consistency. No scene-count claims until distinct concepts and eligibility are measured. Keep all testing isolated; never replace existing NAHLATY runtime.
