#!/usr/bin/env python3
"""Acquire only the public-domain HeartModel portion of Takashi Ijiri HeartSim v4.

This script intentionally does not copy or redistribute the bundled simulator,
whose project page limits it to demonstration use.
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

def safe_extract_heart_model(data: bytes) -> list[dict]:
    if RAW.exists():
        shutil.rmtree(RAW)
    RAW.mkdir(parents=True, exist_ok=True)

    entries = []
    with zipfile.ZipFile(ARCHIVE) as zf:
        for info in zf.infolist():
            normalized = info.filename.replace("\\", "/").lstrip("/")
            parts = pathlib.PurePosixPath(normalized).parts
            if "HeartModel" not in parts:
                continue
            heart_index = parts.index("HeartModel")
            relative_parts = parts[heart_index + 1 :]
            if not relative_parts:
                continue
            target = RAW.joinpath(*relative_parts)
            resolved = target.resolve()
            if RAW.resolve() not in resolved.parents and resolved != RAW.resolve():
                raise RuntimeError(f"Unsafe archive path: {info.filename}")
            if info.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as src, target.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            entries.append({
                "archivePath": normalized,
                "localPath": str(target.relative_to(ROOT)),
                "bytes": info.file_size,
                "crc32": f"{info.CRC:08x}",
            })
    return entries

def main() -> None:
    data = download()
    actual = git_blob_sha(data)
    if actual != EXPECTED_GIT_BLOB_SHA:
        raise SystemExit(
            f"Source integrity check failed. Expected Git blob {EXPECTED_GIT_BLOB_SHA}, got {actual}."
        )

    entries = safe_extract_heart_model(data)
    if not entries:
        raise SystemExit("No HeartModel files found; refusing to continue.")

    payload = {
        "sourceUrl": URL,
        "sourceGitBlobSha": actual,
        "licenseScope": "HeartModel files only: Public Domain per source project page.",
        "simulatorRedistribution": "DISALLOWED by source project page; simulator is intentionally not extracted.",
        "files": entries,
    }
    INVENTORY.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Verified and extracted {len(entries)} HeartModel files to {RAW}")
    print(f"Inventory: {INVENTORY}")

if __name__ == "__main__":
    main()
