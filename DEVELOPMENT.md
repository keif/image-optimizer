# Development Guide

This guide covers the day-to-day workflows for hacking on Squish locally. Use it alongside `INSTALL.md` (binary downloads) and `_docs/DOCKER_DEPLOYMENT.md` (production guidance).

## Prerequisites

### Local API Development

- Go **1.24+**
- **libvips 8.17+**
  - macOS: `brew install vips`
  - Ubuntu/Debian: `sudo apt-get install -y libvips-dev`
  - Alpine: `apk add vips-dev`

### Containerized Workflows

- Docker + Docker Compose
- Optional: [Tilt](https://tilt.dev) for hot reloads

## Run the API with Go

```bash
cd api
go mod download
go run main.go
```

The API listens on `http://localhost:8080` and exposes Swagger UI at `/swagger/index.html`.

## Run the Full Stack with Docker Compose

```bash
docker-compose up --build      # build + start API + web
docker-compose up -d           # run in the background
docker-compose logs -f         # follow logs
docker-compose down            # stop services
docker-compose down -v         # also remove volumes (resets SQLite)
```

Defaults:

- Web UI: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger/index.html`

> **Note:** `API_KEY_AUTH_ENABLED` is disabled in the compose file for easier testing. Set it to `true` and create a key via `/api/keys` when you need auth locally.

## Run with Tilt (live dev)

```bash
tilt up            # opens the Tilt UI in your browser
tilt up --stream   # stream logs in the terminal
tilt down          # stop everything
```

Tilt gives you live rebuilds, a dashboard at `http://localhost:10350`, and buttons to run API tests, lint, and coverage tasks from the UI.

## Tooling & QA

### Pre-Commit Hooks

```bash
./setup-hooks.sh
pre-commit run --all-files   # run manually
```

Hooks run Go linters, TypeScript checks, formatting, Markdown lint, secret scanning, and whitespace fixes. See `PRE_COMMIT_GUIDE.md` for details.

### Building Binaries

```bash
cd api
go build -o image-optimizer
./image-optimizer
```

### Testing

```bash
cd api
go test -v ./...                       # full suite
go test -v -cover ./...                # coverage numbers
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out       # HTML report
go test -v -race ./services/...        # targeted + race detector
```

Test coverage snapshots:

- Services: ~84%
- Routes: ~70%
- Middleware/auth: dedicated tests in `api/middleware`

### Continuous Integration

GitHub Actions runs formatting, tests (including race detector), coverage, Go/CLI builds, and Docker image builds on every push. Workflow: `.github/workflows/test.yml`.
