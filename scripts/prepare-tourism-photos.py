"""Prepare small, correctly framed photos from explicitly attributed IFEZ KOGL Type 1 originals.

Only run on an isolated review branch. Source URLs and dates are tracked in
src/data/tourismPhotos.ts and docs/tourism-photo-licenses.md.
"""
from __future__ import annotations

import hashlib
import io
from pathlib import Path
from urllib.parse import urlsplit

import requests
from PIL import Image, ImageOps, UnidentifiedImageError

IMAGES = {
    "central-park": "https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=BBF6B536673A5B2&sn=85706",
    "tri-bowl": "https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=045DA12E9951914&sn=77775",
    "g-tower": "https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=BDB6955ECD28406&sn=79213",
    "hanok-village": "https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=82F891E36E940DF&sn=79153",
    "haedoji-park": "https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=D1B3601E7AA9725&sn=79708",
    "michuhol-park": "https://www.ifez.go.kr/other/attach/process.file.do?TP=dn&key=ECC9BD5DA50E85F&sn=79476",
}
DEST = Path("public/tourism-photos")

def fetch(s: requests.Session, url: str) -> bytes:
    assert urlsplit(url).hostname == "www.ifez.go.kr"
    for attempt in range(3):
        try:
            with s.get(url, stream=True, timeout=(20, 90)) as r:
                r.raise_for_status()
                output = bytearray()
                for chunk in r.iter_content(1024 * 128):
                    output.extend(chunk)
                    if len(output) > 28 * 1024 * 1024:
                        raise ValueError("Original image exceeds 28 MiB")
                if len(output) < 3000:
                    raise ValueError("Source returned no actual photo")
                return bytes(output)
        except (requests.RequestException, ValueError) as exc:
            print(f"Source attempt {attempt + 1} failed: {type(exc).__name__}: {exc}", flush=True)
            if attempt == 2:
                raise
    raise RuntimeError("unreachable")

def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    with requests.Session() as s:
        s.headers.update({"User-Agent": "Mozilla/5.0 (compatible; CPH-Photo-Optimization/1.0)",
                          "Accept": "image/avif,image/webp,image/apng,image/jpeg,image/png,image/*;q=0.8",
                          "Referer": "https://www.ifez.go.kr/"})
        for photo_id, url in IMAGES.items():
            data = fetch(s, url)
            try:
                with Image.open(io.BytesIO(data)) as original:
                    original.verify()
                with Image.open(io.BytesIO(data)) as original:
                    original = ImageOps.exif_transpose(original)
                    original.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
                    im = original.convert("RGB")
                    dst = DEST / f"{photo_id}.webp"
                    im.save(dst, format="WEBP", quality=80, method=6)
                    print(f"{photo_id}: original={len(data)}B output={dst.stat().st_size}B "
                          f"size={im.width}x{im.height} sha256={hashlib.sha256(dst.read_bytes()).hexdigest()}", flush=True)
                    if dst.stat().st_size > 350_000:
                        raise ValueError(f"Image file is too large for mobile: {dst}")
            except (OSError, UnidentifiedImageError) as exc:
                raise ValueError(f"Invalid source image for {photo_id}") from exc
    assert len(list(DEST.glob("*.webp"))) == len(IMAGES)

if __name__ == "__main__":
    main()
