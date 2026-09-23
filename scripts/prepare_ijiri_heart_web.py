#!/usr/bin/env python3
"""Prepare the inspected public-domain Ijiri heart surface for the web pilot."""

from __future__ import annotations

import json
import pathlib

import trimesh

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / ".asset-cache" / "ijiri-heart-v4"
SOURCE = CACHE / "raw" / "version4Mesh.obj"
PUBLIC_DIR = ROOT / "public" / "assets" / "heart"
GLB = PUBLIC_DIR / "ijiri-heart-v4.glb"
PROVENANCE = PUBLIC_DIR / "ijiri-heart-v4.provenance.json"


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit("Run scripts/acquire_ijiri_heart.py first.")

    mesh = trimesh.load(SOURCE, force="mesh", process=True)
    if not isinstance(mesh, trimesh.Trimesh):
        raise SystemExit("Expected one mesh.")

    mesh.apply_translation(-mesh.bounding_box.centroid)
    extent = float(mesh.extents.max())
    if extent <= 0:
        raise SystemExit("Invalid mesh extents.")
    mesh.apply_scale(2.8 / extent)
    _ = mesh.vertex_normals

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    mesh.export(GLB, file_type="glb")

    payload = {
        "id": "ijiri-heart-v4",
        "purpose": "interaction/navigation pilot only; not final anatomical master asset",
        "source": "Takashi Ijiri Full Heart Model v4",
        "sourceProject": "https://takashiijiri.com/projects/ProjHeartSim/index.html",
        "sourceRepository": "TakashiIjiri/TakashiIjiri.github.io",
        "sourceArchiveGitBlobSha": "21471b533398d1804dc7c58d46537de986773149",
        "sourceFile": "version4Mesh.obj",
        "license": "Public Domain for heart models per source project page",
        "attributionRequired": False,
        "simulatorIncluded": False,
        "geometry": {
            "vertices": int(len(mesh.vertices)),
            "faces": int(len(mesh.faces)),
            "connectedComponents": int(len(mesh.split(only_watertight=False))),
            "watertight": bool(mesh.is_watertight),
        },
        "limitations": [
            "single undivided surface mesh",
            "no semantic chamber/valve parts",
            "no UV texture coordinates in source OBJ",
            "pilot validates interaction grammar, camera depth, clipping and mobile UX"
        ]
    }
    PROVENANCE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {GLB} ({GLB.stat().st_size} bytes)")
    print(f"Wrote {PROVENANCE}")


if __name__ == "__main__":
    main()
