#!/usr/bin/env python3
"""Acquire only the public-domain heart-model files from Takashi Ijiri HeartSim v4.

The source project page states that the heart models are Public Domain while the
bundled simulator is demonstration-only and must not be redistributed. This
script therefore extracts only documented model files and never the simulator.
"""

from __future__ import annotations

import hashlib
import json
import pathlib
import shutil
import urllib.request
import zipfile

URL = "https://raw.githubusercontent.com/TakashiIjiri/TakashiIjiri.github.io/master/projects/ProjHeartSim/HeartSim20150114_v4.zip"
EXPECTED_GIT_BLOB_SHA = "21471b533398d1804dc7c58d46537de986773149"

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / ".asset-cache" / "ijiri-heart-v4"
ARCHIVE = CACHE / "HeartSim20150114_v4.zip"
RAW = CACHE / "raw"
INVENTORY = CACHE / "inventory.json"

DOCUMENTED_PREFIXES = (
    "version4",
    "Model_A",
    "Model_B",
    "Model_C",
)

ALLOWED_EXTENSIONS = {
    ".blend",
    ".obj",
    ".off",
    ".node",
    ".ele",
    ".face",
    ".edge",
    ".msh",
    ".txt",
}

def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()

def download() -> bytes:
    CACHE.mkdir(parents=True, exist_ok=True)
    if ARCHIVE.exists():
        return ARCHIVE.read_bytes()
    with urllib.request.urlopen(URL, timeout=90) as response:
        data = response.read()
    ARCHIVE.write_bytes(data)
    return data

def is_documented_heart_model(info: zipfile.ZipInfo) -> bool:
    if info.is_dir():
        return False
    name = pathlib.PurePosixPath(info.filename.replace("\\", "/")).name
    suffix = pathlib.PurePosixPath(name).suffix.lower()
    return name.startswith(DOCUMENTED_PREFIXES) and suffix in ALLOWED_EXTENSIONS

def safe_extract_heart_models() -> list[dict]:
    if RAW.exists():
        shutil.rmtree(RAW)
    RAW.mkdir(parents=True, exist_ok=True)

    entries = []
    with zipfile.ZipFile(ARCHIVE) as zf:
        for info in zf.infolist():
            if not is_documented_heart_model(info):
                continue
            normalized = info.filename.replace("\\", "/").lstrip("/")
            name = pathlib.PurePosixPath(normalized).name
            target = RAW / name
            with zf.open(info) as src, target.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            entries.append({
                "archivePath": normalized,
                "localPath": str(target.relative_to(ROOT)),
                "bytes": info.file_size,
                "crc32": f"{info.CRC:08x}",
            })

        if not entries:
            names = [info.filename for info in zf.infolist()]
            print("Archive members:", json.dumps(names[:250], indent=2))

    return entries

def main() -> None:
    data = download()
    actual = git_blob_sha(data)
    if actual != EXPECTED_GIT_BLOB_SHA:
        raise SystemExit(
            f"Source integrity check failed. Expected Git blob {EXPECTED_GIT_BLOB_SHA}, got {actual}."
        )

    entries = safe_extract_heart_models()
    if not entries:
        raise SystemExit("No documented heart-model files found; refusing to continue.")

    payload = {
        "sourceUrl": URL,
        "sourceGitBlobSha": actual,
        "licenseScope": "Documented heart-model files only: Public Domain per source project page.",
        "simulatorRedistribution": "DISALLOWED by source project page; simulator files are intentionally excluded.",
        "files": entries,
    }
    INVENTORY.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Verified and extracted {len(entries)} documented heart-model files to {RAW}")
    print(f"Inventory: {INVENTORY}")

if __name__ == "__main__":
    main()
