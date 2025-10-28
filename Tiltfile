# ───────────────────────────────────────────────────────────────
# Tiltfile for Squish (Image Optimizer)
# ───────────────────────────────────────────────────────────────
# NOTE: Tilt v0.34.2 has a bug where docker-compose services show
# "Updating" even when healthy. This is cosmetic - services work fine.
# ───────────────────────────────────────────────────────────────

# Use docker-compose with build configuration
docker_compose('./docker-compose.yml')

# Configure resources
dc_resource('api', labels=['backend'])
dc_resource('web', labels=['frontend'], resource_deps=['api'])

# ───────────────────────────────────────────────────────────────
# Optional manual dev tools
# ───────────────────────────────────────────────────────────────

local_resource(
    'api-tests',
    'cd api && go test -v ./...',
    deps=['./api'],
    labels=['tests'],
    trigger_mode=TRIGGER_MODE_MANUAL,
)

local_resource(
    'api-lint',
    'cd api && go vet ./...',
    deps=['./api'],
    labels=['lint'],
    trigger_mode=TRIGGER_MODE_MANUAL,
)

# ───────────────────────────────────────────────────────────────
# Banner
# ───────────────────────────────────────────────────────────────
print("""
╔════════════════════════════════════════════════════════════════╗
║                       Squish - Tilt                            ║
╠════════════════════════════════════════════════════════════════╣
║  Services:                                                     ║
║    • API Server:    http://localhost:8080                      ║
║    • Web Interface: http://localhost:3000                      ║
║    • Swagger Docs:  http://localhost:8080/swagger/index.html   ║
║    • Tilt UI:       http://localhost:10350                     ║
╚════════════════════════════════════════════════════════════════╝
""")