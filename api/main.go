package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/keif/image-optimizer/db"
	"github.com/keif/image-optimizer/middleware"
	"github.com/keif/image-optimizer/routes"

	_ "github.com/keif/image-optimizer/docs" // Import generated swagger docs
	fiberswagger "github.com/swaggo/fiber-swagger"
)

// @title Image Optimizer API
// @version 1.0
// @description High-performance image optimization service with format conversion, resizing, and quality adjustment
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://github.com/keif/image-optimizer/issues
// @contact.email support@example.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /
// @schemes http https

func main() {
	// Initialize database
	if err := db.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	app := fiber.New(fiber.Config{
		AppName: "Image Optimizer API v1.0",
	})

	// Middleware
	app.Use(logger.New())

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

	// Configure CORS with environment variable support
	allowedOrigins := os.Getenv("CORS_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000,http://localhost:8080"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowCredentials: true,
	}))
	app.Use(middleware.NewRateLimiter())
	app.Use(middleware.RequireAPIKey())

	// Health check endpoint
	// @Summary Health check
	// @Description Check if the API is running
	// @Tags health
	// @Produce json
	// @Success 200 {object} map[string]string
	// @Router /health [get]
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Swagger documentation endpoint
	app.Get("/swagger/*", fiberswagger.WrapHandler)

	// Register routes
	routes.RegisterOptimizeRoutes(app)
	routes.RegisterAPIKeyRoutes(app)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
