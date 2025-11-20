# API Reference

Squish exposes a small REST surface area. Use this guide for quick reminders, and visit the live Swagger docs at `http://localhost:8080/swagger/index.html` (or `https://api.sosquishy.io/swagger/index.html`) for exhaustive schemas.

## Health Check

```http
GET /health
```

Returns `{ "status": "ok" }` plus version/build metadata when available. Useful for readiness probes.

## Optimize a Single Image

```http
POST /optimize
Content-Type: multipart/form-data
```

Inputs:

| Type | Parameter | Notes |
|------|-----------|-------|
| File | `image`   | Upload a file (mutually exclusive with `url`) |
| Text | `url`     | Remote image URL (respecting whitelist + SSRF protections) |

Key query params:

- `quality` (1-100, default 80)
- `width` / `height` (pixels, 0 = keep original, aspect ratio preserved)
- `format` (`jpeg`, `png`, `webp`, `avif`, `gif`)
- `returnImage` (`true` returns binary image, `false` returns JSON metadata)
- Advanced knobs: JPEG (`progressive`, `subsample`, `smooth`, `optimizeCoding`), PNG (`compression`, `interlace`, `palette`, `oxipngLevel`), WebP (`lossless`, `effort`, `webpMethod`), `forceSRGB`

Example:

```bash
curl -X POST "http://localhost:8080/optimize?format=webp&quality=85" \
  -F "image=@photo.jpg" \
  --output photo.webp
```

## Batch Optimize

```http
POST /batch-optimize
Content-Type: multipart/form-data
```

Accepts multiple `images=@file` or URLs with the same query parameters as `/optimize`. Returns an array of optimization results plus aggregated totals.

## Sprite Packing

```http
POST /pack-sprites
Content-Type: multipart/form-data
```

Upload multiple `images=@sprite.png` parts and configure how they should be packed.

Important parameters:

- `padding` (0-32) — spacing between frames
- `trimTransparency` + `trimThreshold` — remove transparent borders
- `trimOnly` / `trimExcept` — glob patterns for selective trimming
- `powerOfTwo` — force power-of-two atlas dimensions
- `maxWidth` / `maxHeight` — atlas bounds (default 4096)
- `outputFormats` — comma list (`json`, `css`, `csv`, `xml`, `sparrow`, `texturepacker`, `cocos2d`, `unity`, `godot`)
- `imagePath` — override spritesheet filename inside metadata
- `packingMode` — `optimal` (best efficiency), `smart` (balance of efficiency + frame order), `preserve` (strict upload order)
- `compressionQuality` — `fast`, `balanced`, `best` (maps to PNG + OxiPNG levels)

Response includes base64-encoded PNG sheets plus metadata and requested coordinate files.

## Optimize Existing Spritesheet

```http
POST /optimize-spritesheet
Content-Type: multipart/form-data
```

Provide `spritesheet` (PNG) and `xml` (Sparrow/Starling metadata). Optional params mirror `/pack-sprites` with extras:

- `deduplicate` — remove duplicate frames while keeping name mapping
- `preserveFrameOrder` — default `true` to keep animation sequences

Useful for cleaning up exported atlases before shipping to a game engine.

## Metrics

Endpoints (all `GET` unless noted):

- `/metrics/summary?days=30`
- `/metrics/formats?days=30`
- `/metrics/timeline?days=7&interval=hour`
- `POST /admin/cleanup-metrics?days=30`

See `METRICS_OPERATIONS.md` for detailed workflows, retention guidance, and scripts.

## Authentication

All write endpoints require API keys unless explicitly bypassed (health, swagger, bootstrap key creation). See `_docs/API_KEYS.md` for bootstrapping tips and auth examples.
