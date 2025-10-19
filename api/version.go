package main

// Build-time variables injected via -ldflags
// These are set during docker build using git information
var (
	// version is the application version (from git tag or commit)
	// Set via: -ldflags "-X main.version=$(git describe --tags --always)"
	version = "dev"

	// commit is the git commit hash
	// Set via: -ldflags "-X main.commit=$(git rev-parse --short HEAD)"
	commit = "none"

	// buildTime is the build timestamp
	// Set via: -ldflags "-X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
	buildTime = "unknown"
)

// GetVersion returns the current application version
func GetVersion() string {
	return version
}

// GetCommit returns the git commit hash
func GetCommit() string {
	return commit
}

// GetBuildTime returns the build timestamp
func GetBuildTime() string {
	return buildTime
}
