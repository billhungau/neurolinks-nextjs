#!/usr/bin/env python3
"""Crop and grade the services-page ketamine vial photograph.

Source: clinic windowsill still (orchid + vial). Output is a 1:1 editorial
frame matching .svc-photo-ket.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


SRC_DEFAULT = Path("public/media/images/ketamine-vial-sill-source.webp")
OUT_DEFAULT = Path("public/media/images/ketamine-vial-sill.webp")
SIZE = 1400
# Right-weighted square: vial as the anchor, orchid kept as context.
CROP = (472, 0, 1024)


def highlight_roll(img: Image.Image) -> Image.Image:
    """Pull the blown window down without flattening the vial."""
    pulled = ImageEnhance.Brightness(img).enhance(0.86)
    mask = img.convert("L").point(lambda p: max(0, min(255, int((p - 168) * 3.4))))
    return Image.composite(pulled, img, mask)


def warm_grade(img: Image.Image) -> Image.Image:
    cream = Image.new("RGB", img.size, (243, 236, 220))
    warmed = Image.blend(img, cream, 0.11)
    r, g, b = warmed.split()
    r = r.point(lambda p: min(255, int(p * 1.035 + 3)))
    b = b.point(lambda p: max(0, int(p * 0.94)))
    return Image.merge("RGB", (r, g, b))


def vignette(img: Image.Image, strength: float = 0.22) -> Image.Image:
    w, h = img.size
    overlay = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(overlay)
    margin = int(min(w, h) * 0.06)
    draw.ellipse((-margin, int(h * 0.02), w + margin, h + int(h * 0.18)), fill=255)
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.18)))
    dark = ImageEnhance.Brightness(img).enhance(1 - strength)
    return Image.composite(img, dark, overlay)


def process(src: Path, out: Path) -> None:
    image = Image.open(src).convert("RGB")
    left, top, size = CROP
    frame = image.crop((left, top, left + size, top + size))
    frame = frame.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    frame = highlight_roll(frame)
    frame = warm_grade(frame)
    frame = ImageEnhance.Contrast(frame).enhance(1.07)
    frame = ImageEnhance.Color(frame).enhance(0.94)
    frame = ImageEnhance.Brightness(frame).enhance(0.98)
    frame = vignette(frame)
    frame = frame.filter(ImageFilter.UnsharpMask(radius=1.4, percent=130, threshold=2))
    out.parent.mkdir(parents=True, exist_ok=True)
    frame.save(out, "WEBP", quality=90, method=6)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", type=Path, default=SRC_DEFAULT)
    parser.add_argument("--out", type=Path, default=OUT_DEFAULT)
    args = parser.parse_args()
    process(args.src, args.out)


if __name__ == "__main__":
    main()
