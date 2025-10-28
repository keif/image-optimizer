// Package main is the entry point for the standalone all-in-one Image Optimizer binary.
// It combines the API server with an embedded Next.js frontend to create a single executable
// that can run locally without any external dependencies.
package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/keif/image-optimizer/db"
	"github.com/keif/image-optimizer/middleware"
	"github.com/keif/image-optimizer/routes"

	_ "github.com/keif/image-optimizer/docs" // Import generated swagger docs
	fiberswagger "github.com/swaggo/fiber-swagger"
)

// Build-time variables (set via ldflags during build)
var (
	version   = "dev"
	commit    = "none"
	buildTime = "unknown"
)

// Embed the static frontend files at build time
// This embeds the entire web/out directory into the binary
//
//go:embed embedded/*
var embeddedFS embed.FS

func main() {
	// Parse command-line flags
	port := flag.Int("port", 3000, "Port to listen on")
	showVersion := flag.Bool("version", false, "Show version information")
	flag.Parse()

	// Show version information and exit if requested
	if *showVersion {
		fmt.Printf("Image Optimizer Standalone\n")
		fmt.Printf("Version: %s\n", version)
		fmt.Printf("Commit: %s\n", commit)
		fmt.Printf("Build Time: %s\n", buildTime)
		os.Exit(0)
	}

	// Log version information on startup
	log.Printf("Image Optimizer Standalone")
	log.Printf("Version: %s", version)
	log.Printf("Commit: %s", commit)
	log.Printf("Build Time: %s", buildTime)

	// Initialize database
	// For standalone, we'll use a local database file in the current directory
	if os.Getenv("DB_PATH") == "" {
		// Create data directory in user's home directory or current directory
		homeDir, err := os.UserHomeDir()
		dbDir := "./data"
		if err == nil {
			dbDir = filepath.Join(homeDir, ".image-optimizer", "data")
		}
		if err := os.MkdirAll(dbDir, 0750); err != nil {
			log.Printf("Warning: Failed to create data directory in home: %v, using ./data", err)
			dbDir = "./data"
			if err := os.MkdirAll(dbDir, 0750); err != nil {
				log.Fatalf("Failed to create data directory: %v", err)
			}
		}
		os.Setenv("DB_PATH", filepath.Join(dbDir, "api_keys.db"))
		log.Printf("Database location: %s", filepath.Join(dbDir, "api_keys.db"))
	}

	if err := db.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("warning: failed to close database: %v", err)
		}
	}()

	app := fiber.New(fiber.Config{
		AppName:      "Image Optimizer Standalone v1.0",
		BodyLimit:    20 * 1024 * 1024, // 20MB limit for large spritesheet uploads
		ReadTimeout:  7 * time.Minute,  // 7 minute read timeout for large file uploads
		WriteTimeout: 7 * time.Minute,  // 7 minute write timeout for processing large sprites (100MP+)
		IdleTimeout:  10 * time.Minute, // 10 minute idle timeout
	})

	// Middleware
	app.Use(logger.New())

	// Response compression (gzip, deflate, brotli)
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	// Security headers middleware
	app.Use(func(c *fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// Only set HSTS if running over HTTPS
		if c.Protocol() == "https" {
			c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		return c.Next()
	})

	// For standalone mode, we serve both frontend and backend on same origin
	// No CORS needed since it's same-origin
	// But we'll add it for potential future use with --cors flag
	allowedOrigins := fmt.Sprintf("http://localhost:%d", *port)
	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		if origin == "" || strings.Contains(allowedOrigins, origin) {
			c.Set("Access-Control-Allow-Origin", "*")
			c.Set("Access-Control-Allow-Credentials", "true")
			c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")
			c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		}
		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusNoContent)
		}
		return c.Next()
	})

	// Apply rate limiting and metrics middleware
	// Note: API key authentication is DISABLED for standalone mode (local use)
	// Users can enable it by setting API_KEY_AUTH_ENABLED=true environment variable
	app.Use(middleware.NewRateLimiter())
	if os.Getenv("API_KEY_AUTH_ENABLED") == "true" {
		app.Use(middleware.RequireAPIKey())
	}
	app.Use(middleware.NewMetricsCollector())

	// Health check endpoint with version information
	app.Get("/health", routes.HealthHandler(version, commit))

	// Swagger documentation endpoint
	app.Get("/swagger/*", fiberswagger.WrapHandler)

	// Register API routes
	routes.RegisterOptimizeRoutes(app)
	routes.RegisterAPIKeyRoutes(app)
	routes.SetupSpritesheetRoutes(app)
	routes.SetupMetricsRoutes(app)
	routes.SetupAdminRoutes(app)

	// Serve embedded frontend
	// The frontend is served from the root path, API routes are prefixed
	setupFrontendRoutes(app)

	// Print startup message
	log.Printf("")
	log.Printf("========================================")
	log.Printf("  Image Optimizer is ready!")
	log.Printf("========================================")
	log.Printf("")
	log.Printf("  Open in your browser:")
	log.Printf("    http://localhost:%d", *port)
	log.Printf("")
	log.Printf("  API Documentation:")
	log.Printf("    http://localhost:%d/swagger/index.html", *port)
	log.Printf("")
	if os.Getenv("API_KEY_AUTH_ENABLED") == "true" {
		log.Printf("  🔒 API Key Authentication: ENABLED")
	} else {
		log.Printf("  🔓 API Key Authentication: DISABLED (local use)")
	}
	log.Printf("")
	log.Printf("  Press Ctrl+C to stop")
	log.Printf("")

	// Start server
	if err := app.Listen(fmt.Sprintf(":%d", *port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// setupFrontendRoutes configures the embedded frontend file serving
func setupFrontendRoutes(app *fiber.App) {
	// Get the embedded filesystem
	// Strip the "embedded" prefix to serve files from root
	stripped, err := fs.Sub(embeddedFS, "embedded")
	if err != nil {
		log.Printf("Warning: Failed to setup embedded filesystem: %v", err)
		log.Printf("Frontend will not be available. API endpoints will still work.")
		return
	}

	// Serve static files for assets (images, js, css, etc.)
	app.Use("/", filesystem.New(filesystem.Config{
		Root:         http.FS(stripped),
		Browse:       false,
		Index:        "index.html",
		NotFoundFile: "404.html",
		MaxAge:       3600, // Cache static assets for 1 hour
	}))
}
