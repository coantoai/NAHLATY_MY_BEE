#!/usr/bin/env python3
"""Make the NIAID heart strictly vector, retaining the original anatomy paths.

Usage: python3 scripts/prepare-niaid-heart.py /path/to/downloaded-source.svg
Requires Pillow and numpy. This is an offline build tool, not an application
dependency. PNG luminance masks become quantized native SVG paths; it does not
trace, rename, or infer anatomy. The original drawing coordinates are unchanged.
"""

import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image

SVG = "http://www.w3.org/2000/svg"
XLINK = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG)
ET.register_namespace("xlink", XLINK)


def runs_to_rectangles(pixels):
    """Merge equal, adjacent horizontal runs vertically, without overlap."""
    active = {}
    rectangles = []
    height, width = pixels.shape
    for y in range(height):
        row = pixels[y]
        starts = np.r_[0, np.flatnonzero(row[1:] != row[:-1]) + 1]
        ends = np.r_[starts[1:], width]
        next_active = {}
        for x0, x1 in zip(starts, ends):
            key = (int(row[x0]), int(x0), int(x1))
            next_active[key] = (active[key][0], y + 1) if key in active else (y, y + 1)
        for key, extent in active.items():
            if key not in next_active:
                rectangles.append((*key, *extent))
        active = next_active
    rectangles.extend((*key, *extent) for key, extent in active.items())
    return rectangles


def vectorize_mask(image_element, index, max_edge, levels):
    href = image_element.get(f"{{{XLINK}}}href", image_element.get("href", ""))
    if not href.startswith("data:image/png;base64,"):
        raise ValueError("Only the expected embedded PNG luminance masks are supported")
    image = Image.open(io.BytesIO(base64.b64decode(href.split(",", 1)[1]))).convert("RGBA")
    original_width, original_height = image.size
    scale = min(1, max_edge / max(image.size))
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    # The original feFlood/feBlend filter composites masks over white. Perform
    # that same alpha composite before quantization; mask RGB is grayscale.
    image = Image.alpha_composite(Image.new("RGBA", image.size, "white"), image)
    image = image.convert("L").resize(size, Image.Resampling.LANCZOS)
    values = np.rint(np.asarray(image, dtype=float) * (levels - 1) / 255).astype(np.uint8)
    rectangles = runs_to_rectangles(values)
    width = float(image_element.get("width", str(original_width)))
    height = float(image_element.get("height", str(original_height)))
    x, y = float(image_element.get("x", "0")), float(image_element.get("y", "0"))
    # SVG <image> defaults to xMidYMid meet, not stretch. Several original
    # image viewports differ from their PNG dimensions by one or two pixels.
    aspect = image_element.get("preserveAspectRatio", "xMidYMid meet")
    if aspect == "none":
        content_width, content_height = width, height
    elif aspect in ("xMidYMid", "xMidYMid meet"):
        meet = min(width / original_width, height / original_height)
        content_width, content_height = original_width * meet, original_height * meet
        x += (width - content_width) / 2
        y += (height - content_height) / 2
    else:
        raise ValueError(f"Unsupported image preserveAspectRatio: {aspect}")
    group = ET.Element(f"{{{SVG}}}g", {
        "id": f"niaid-vector-mask-{index:03d}",
        "transform": image_element.get("transform", ""),
        "data-vectorized-mask": "luminance",
    })
    for name in ("opacity", "style", "class"):
        if image_element.get(name):
            group.set(name, image_element.get(name))
    inner = ET.SubElement(group, f"{{{SVG}}}g", {
        "transform": f"translate({x:.9g} {y:.9g}) scale({content_width / size[0]:.9g} {content_height / size[1]:.9g})",
        "shape-rendering": "crispEdges",
    })
    by_level = {}
    for level, x0, x1, y0, y1 in rectangles:
        by_level.setdefault(level, []).append(f"M{x0} {y0}h{x1-x0}v{y1-y0}h{x0-x1}z")
    for level, commands in sorted(by_level.items()):
        gray = round(level * 255 / (levels - 1))
        ET.SubElement(inner, f"{{{SVG}}}path", {
            "fill": f"#{gray:02x}{gray:02x}{gray:02x}",
            "d": "".join(commands),
        })
    return group, {"id": group.get("id"), "sampleSize": list(size), "rectangles": len(rectangles)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/heart-vector/niaid-heart.svg"))
    parser.add_argument("--max-edge", type=int, default=160)
    parser.add_argument("--levels", type=int, default=32)
    args = parser.parse_args()
    if not 2 <= args.levels <= 256 or args.max_edge < 8:
        parser.error("levels must be 2–256 and max-edge at least 8")
    source = args.source.read_bytes()
    root = ET.fromstring(source)
    if root.tag != f"{{{SVG}}}svg":
        raise ValueError("Expected the NIAID SVG document")
    root.set("id", "heart-root")
    root.set("role", "img")
    root.set("aria-labelledby", "niaid-heart-title")
    title = ET.Element(f"{{{SVG}}}title", {"id": "niaid-heart-title"})
    title.text = "Human Heart — Ryan Kissinger, courtesy of NIAID"
    root.insert(0, title)
    original_geometry = []
    original_groups = []

    def identify(element, in_defs=False):
        in_defs = in_defs or element.tag == f"{{{SVG}}}defs"
        if not in_defs and element.tag == f"{{{SVG}}}path":
            element_id = element.get("id") or f"niaid-path-{len(original_geometry)+1:03d}"
            element.set("id", element_id)
            element.set("data-source-kind", "anatomy-path")
            original_geometry.append({"elementId": element_id, "sourceClass": element.get("class", ""), "pathSha256": hashlib.sha256(element.get("d", "").encode()).hexdigest()})
        elif not in_defs and element.tag == f"{{{SVG}}}g":
            element_id = element.get("id") or f"niaid-group-{len(original_groups)+1:03d}"
            element.set("id", element_id)
            original_groups.append(element_id)
        for child in element:
            identify(child, in_defs)

    identify(root)
    mask_info = []
    for parent in root.iter():
        for child in list(parent):
            if child.tag == f"{{{SVG}}}image":
                converted, info = vectorize_mask(child, len(mask_info)+1, args.max_edge, args.levels)
                converted.tail = child.tail
                parent.insert(list(parent).index(child), converted)
                parent.remove(child)
                mask_info.append(info)
    # The source's plain metadata must explicitly stay in the default SVG
    # namespace when serialized with an unprefixed SVG root.
    for element in root.iter():
        if not element.tag.startswith("{"):
            element.tag = f"{{{SVG}}}{element.tag}"
    disclosure = ET.SubElement(root, f"{{{SVG}}}metadata", {"id": "niaid-vector-provenance"})
    disclosure.text = "Original NIAID anatomy paths preserved. Embedded PNG luminance masks approximated by native SVG paths; no raster remains. No clinical anatomy bindings inferred. Courtesy of NIAID; Ryan Kissinger; Public Domain. https://bioart.niaid.nih.gov/bioart/228"
    args.output.parent.mkdir(parents=True, exist_ok=True)
    output = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    if b"data:image/" in output or any(element.tag == f"{{{SVG}}}image" for element in root.iter()):
        raise ValueError("Raster data survived conversion")
    args.output.write_bytes(output)
    provenance = {
        "assetId": "niaid-bioart-228-file-630873",
        "title": "Human Heart",
        "provider": "NIH/NIAID BioArt",
        "creator": "Ryan Kissinger",
        "credit": "Courtesy of NIAID",
        "license": "Public Domain",
        "sourcePage": "https://bioart.niaid.nih.gov/bioart/228",
        "sourceUrl": "https://bioart.niaid.nih.gov/api/bioarts/228/files/630873",
        "sourceSha256": hashlib.sha256(source).hexdigest(),
        "svgSha256": hashlib.sha256(output).hexdigest(),
        "viewBox": root.get("viewBox"),
        "originalPathCount": len(original_geometry),
        "originalGroups": original_groups,
        "anatomyPaths": original_geometry,
        "vectorizedMaskCount": len(mask_info),
        "maskConversion": {"maxEdge": args.max_edge, "grayLevels": args.levels, "algorithm": "Lanczos resampling; grayscale luminance quantization; horizontal runs merged vertically into native path rectangles", "masks": mask_info},
        "approximationDisclosure": "All original anatomy paths and transforms are preserved. Only the 28 embedded PNG shading masks are approximated as native grayscale SVG paths. No anatomy has been reconstructed or clinically inferred.",
        "semanticReady": False,
    }
    args.output.with_suffix(".provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "bytes": len(output), "anatomyPaths": len(original_geometry), "vectorizedMasks": len(mask_info), "maskPaths": sum(len(list(g.iter(f'{{{SVG}}}path'))) for g in root.iter(f'{{{SVG}}}g') if g.get('data-vectorized-mask'))}))


if __name__ == "__main__":
    main()
