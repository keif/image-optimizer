# Squish - Image Optimizer

An API-first image optimization service built with Go + Fiber, a Next.js web UI, and a CLI for batch work. Squish targets local development today with a clear path to SaaS-style multi-tenant hosting.

## Quick Links

- Live site: [sosquishy.io](https://sosquishy.io)
- API: `https://api.sosquishy.io` · [Health](https://api.sosquishy.io/health) · [Swagger](https://api.sosquishy.io/swagger/index.html)
- [INSTALL.md](./INSTALL.md) – binary and platform-specific instructions
- [DEVELOPMENT.md](./DEVELOPMENT.md) – local workflows, Docker, and Tilt
- [cli/README.md](./cli/README.md) – `imgopt` CLI guide
- [_docs/API_REFERENCE.md](_docs/API_REFERENCE.md) – REST endpoints
- [_docs/API_KEYS.md](_docs/API_KEYS.md) – authentication & bootstrap tips
- [METRICS_OPERATIONS.md](./METRICS_OPERATIONS.md) – observability + cleanup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) – system overview & feature deep dive
- [ROADMAP.md](./ROADMAP.md) – release track and future phases

## Features

- **Image Optimization**: Resize, convert, and compress images
- **Modern Format Support**: AVIF, WebP, JPEG, PNG, and GIF with format-specific controls
- **Advanced Compression Options**: JPEG progressive encoding, PNG compression levels, WebP lossless, and more
- **Batch Processing**: Optimize multiple images in a single API request
- **Spritesheet Packer**: Pack sprites via MaxRects with smart/optimal/preserve modes
- **Interactive Before/After Comparison**: Visual slider to compare original vs optimized images
- **Privacy First**: No server storage, in-memory processing only, zero tracking
- **RESTful API**: Clean HTTP endpoints with OpenAPI/Swagger docs
- **API Key Authentication**: SQLite-backed key management + rate limiting
- **Usage Metrics & Analytics**: Hourly aggregates with retention + cleanup tooling
- **CLI Tool**: Command-line interface for batch processing and automation
- **Containerized**: Docker-ready for consistent deployment
- **Performance**: Go + Fiber + libvips for high throughput
- **Developer-Friendly**: Simple JSON responses, Tilt workflow, and pre-commit hooks
- **Web UI**: Next.js interface with drag-and-drop uploads and spritesheet tooling

## Support This Project

If Squish saves you time or bandwidth, consider supporting development and hosting costs. Every bit helps keep the public service online.

**Ways to Support:**

- ☕ **[Buy Me a Coffee](https://buymeacoffee.com/keif)** – one-time donation
- 💖 **[GitHub Sponsors](https://github.com/sponsors/keif)** – monthly support
- 🎉 **[Ko-fi](https://ko-fi.com/keif)** – one-time or monthly
- 💰 **[PayPal](https://paypal.me/keif)** – direct donation

**Other Ways to Help:** ⭐ star the repo · 🐛 report bugs · 📝 improve docs · 🔀 send PRs · 📢 share with friends.

## Run It Your Way

### Standalone Binary

Download a self-contained binary (API + web UI) from [INSTALL.md](./INSTALL.md):

```bash
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-darwin-arm64 -o imgopt
chmod +x imgopt
./imgopt  # opens http://localhost:3000
```

### Docker Compose

Spin up the API + web stack:

```bash
docker-compose up --build      # API + web
# docker-compose up -d        # run in background
```

Swagger: `http://localhost:8080/swagger/index.html` · Web UI: `http://localhost:3000`. Authentication is disabled in the compose file for easier testing; flip `API_KEY_AUTH_ENABLED=true` when needed.

### Tilt (Live Dev)

`tilt up` gives hot reloads, log streaming, and UI buttons for tests/lint. See [DEVELOPMENT.md](./DEVELOPMENT.md) for details.

## Documentation Map

| Doc | Purpose |
|-----|---------|
| [INSTALL.md](./INSTALL.md) | Download links + platform-specific notes |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Go dev server, Docker, Tilt, tooling |
| [cli/README.md](./cli/README.md) | Build + use the `imgopt` CLI |
| [_docs/API_REFERENCE.md](_docs/API_REFERENCE.md) | Endpoint summary + usage patterns |
| [_docs/API_KEYS.md](_docs/API_KEYS.md) | Creating, listing, and revoking API keys |
| [METRICS_OPERATIONS.md](./METRICS_OPERATIONS.md) | Metrics API, cleanup script, troubleshooting |
| [_docs/DOCKER_DEPLOYMENT.md](_docs/DOCKER_DEPLOYMENT.md) | Full-stack Docker on Hetzner |
| [_docs/HETZNER_MIGRATION.md](_docs/HETZNER_MIGRATION.md) | VPS migration + deployment guide |
| [_docs/DNS_SETUP.md](_docs/DNS_SETUP.md) | DNS prerequisites for production |
| [_docs/HEALTH_ENDPOINT.md](_docs/HEALTH_ENDPOINT.md) | Health/uptime policies |
| [_docs/SECURITY_REVIEW.md](_docs/SECURITY_REVIEW.md) | Latest security posture |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System diagram, components, feature highlights |
| [STANDALONE_BUILD.md](./STANDALONE_BUILD.md) | Building the all-in-one binary |
| [STANDALONE_QUICKSTART.md](./STANDALONE_QUICKSTART.md) | Quickstart for the standalone release |
| [ROADMAP.md](./ROADMAP.md) | Completed phases + upcoming work |

## CLI

The `imgopt` CLI wraps the API for batch workflows. Build + usage examples live in [cli/README.md](./cli/README.md); configs live in `.imgoptrc` (project or home directory).

## API Overview

Swagger docs ship with every deployment at `/swagger/index.html`. For a human-written summary see [_docs/API_REFERENCE.md](_docs/API_REFERENCE.md). Core endpoints include `/optimize`, `/batch-optimize`, `/pack-sprites`, `/optimize-spritesheet`, the metrics suite, and admin helpers.

## Metrics & Observability

Hourly aggregates, format stats, timelines, and cleanup tooling are documented in [METRICS_OPERATIONS.md](./METRICS_OPERATIONS.md). A cron-friendly `cleanup-metrics.sh` script enforces the default 30-day retention window.

## Deployment Notes

- **Frontend:** Static Next.js export deployed via GitHub Pages — see the "Frontend" section of [_docs/DOCKER_DEPLOYMENT.md](_docs/DOCKER_DEPLOYMENT.md).
- **Backend:** Hetzner Cloud VPS with Caddy reverse proxy — start with [_docs/HETZNER_MIGRATION.md](_docs/HETZNER_MIGRATION.md) for a full walkthrough.
- **Binary releases:** `cmd/standalone` bundles the API + web UI; see `STANDALONE_BUILD.md`.

## Configuration

Environment variables drive behavior (see `.env.example`). Key options:

- `PORT` – API port (default `8080`)
- `DB_PATH` – SQLite location (`./data/api_keys.db` default)
- `RATE_LIMIT_ENABLED`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`
- `API_KEY_AUTH_ENABLED` + `PUBLIC_OPTIMIZATION_ENABLED`
- `METRICS_ENABLED`
- `ALLOWED_DOMAINS` – CSV of allowed hosts for remote fetches

```bash
PORT=8080
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m
API_KEY_AUTH_ENABLED=true
ALLOWED_DOMAINS=cloudinary.com,imgur.com,example.com
```

## Security

Security architecture, mitigations, and audit notes live in [SECURITY.md](./SECURITY.md) and [_docs/SECURITY_REVIEW.md](_docs/SECURITY_REVIEW.md). API key usage and bootstrap flows are documented in [_docs/API_KEYS.md](_docs/API_KEYS.md). Production defaults: API keys + rate limiting enabled, TLS via reverse proxy, strict domain whitelist for URL fetching.

## Architecture & Roadmap

- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) covers system components, technology stack, and feature deep dives.
- **Roadmap:** [ROADMAP.md](./ROADMAP.md) tracks completed phases and upcoming SaaS features.

## License

MIT
