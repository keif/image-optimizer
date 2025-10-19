# Tiltfile for Squish
# Provides hot-reload development environment for both API and web services

# Load docker-compose configuration
docker_compose('./docker-compose.yml')

# Configure API service with live updates
docker_build(
    'squish-api',
    './api',
    dockerfile='./api/Dockerfile',
    live_update=[
        # Sync Go source files to container
        sync('./api', '/app'),
        # Rebuild binary when Go files change
        run(
            'cd /app && go build -o main .',
            trigger=['**/*.go']
        ),
    ]
)

# Configure web service with live updates
docker_build(
    'squish-web',
    './web',
    dockerfile='./web/Dockerfile',
    live_update=[
        # Full rebuild if dependencies change
        fall_back_on([
            './web/package.json',
            './web/pnpm-lock.yaml',
            './web/next.config.mjs',
        ]),
        # Sync source code changes
        sync('./web/app', '/app/app'),
        sync('./web/components', '/app/components'),
        sync('./web/lib', '/app/lib'),
        sync('./web/**/*.css', '/app/'),
    ]
)

# Configure resources from docker-compose
dc_resource(
    'api',
    labels=['backend'],
)

dc_resource(
    'web',
    labels=['frontend'],
    resource_deps=['api'],  # Web depends on API being healthy
)

# Local development tasks
local_resource(
    'api-tests',
    'cd api && go test -v ./...',
    deps=['./api'],
    labels=['tests'],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

local_resource(
    'api-lint',
    'cd api && go vet ./...',
    deps=['./api'],
    labels=['lint'],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

local_resource(
    'api-coverage',
    'cd api && go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html',
    deps=['./api'],
    labels=['tests'],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

# Print helpful information
print("""
╔════════════════════════════════════════════════════════════════╗
║                       Squish - Tilt                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Services:                                                     ║
║    • API Server:    http://localhost:8080                      ║
║    • Web Interface: http://localhost:3000                      ║
║    • Swagger Docs:  http://localhost:8080/swagger/index.html  ║
║    • Tilt UI:       http://localhost:10350                     ║
║                                                                ║
║  Features:                                                     ║
║    • Live reload enabled for both services                     ║
║    • Health checks and dependency management                   ║
║    • Manual test and lint commands available                   ║
║                                                                ║
║  Quick Actions (via Tilt UI):                                  ║
║    • api-tests: Run all API tests                              ║
║    • api-lint: Run Go vet linter                               ║
║    • api-coverage: Generate test coverage report               ║
║                                                                ║
║  Note: Port forwarding configured in docker-compose.yml        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
""")
