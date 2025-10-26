package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3" // SQLite driver for database/sql
)

// DB is the global database connection
var DB *sql.DB

// Initialize creates and initializes the SQLite database
func Initialize() error {
	// Get database path from environment or use default
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/api_keys.db"
	}

	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0750); err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open database connection
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	DB = db

	// Create schema
	if err := createSchema(); err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}

	return nil
}

// createSchema creates the necessary tables
func createSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS api_keys (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		key TEXT NOT NULL UNIQUE,
		name TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		revoked_at DATETIME NULL
	);

	CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
	CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON api_keys(revoked_at);

	-- Metrics: Hourly aggregated request statistics
	CREATE TABLE IF NOT EXISTS metrics_hourly (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp DATETIME NOT NULL,
		endpoint TEXT NOT NULL,
		request_count INTEGER DEFAULT 0,
		success_count INTEGER DEFAULT 0,
		error_count INTEGER DEFAULT 0,
		total_bytes_original INTEGER DEFAULT 0,
		total_bytes_optimized INTEGER DEFAULT 0,
		total_processing_time_ms INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_hourly_time_endpoint
		ON metrics_hourly(timestamp, endpoint);
	CREATE INDEX IF NOT EXISTS idx_metrics_hourly_timestamp ON metrics_hourly(timestamp);

	-- Metrics: Format conversion tracking (hourly buckets)
	CREATE TABLE IF NOT EXISTS metrics_formats (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp DATETIME NOT NULL,
		input_format TEXT NOT NULL,
		output_format TEXT NOT NULL,
		conversion_count INTEGER DEFAULT 0,
		total_bytes_original INTEGER DEFAULT 0,
		total_bytes_optimized INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_formats_time_formats
		ON metrics_formats(timestamp, input_format, output_format);
	CREATE INDEX IF NOT EXISTS idx_metrics_formats_timestamp ON metrics_formats(timestamp);

	-- Metrics: API key usage tracking (hourly buckets)
	CREATE TABLE IF NOT EXISTS metrics_api_keys (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp DATETIME NOT NULL,
		api_key_id INTEGER,
		request_count INTEGER DEFAULT 0,
		success_count INTEGER DEFAULT 0,
		error_count INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
	);

	CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_api_keys_time_key
		ON metrics_api_keys(timestamp, api_key_id);
	CREATE INDEX IF NOT EXISTS idx_metrics_api_keys_timestamp ON metrics_api_keys(timestamp);
	`

	_, err := DB.Exec(schema)
	return err
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
