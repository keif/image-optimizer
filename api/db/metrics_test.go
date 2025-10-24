package db

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates a temporary test database
func setupTestDB(t *testing.T) func() {
	// Create a temporary database file
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_metrics.db")

	// Set the DB_PATH environment variable
	os.Setenv("DB_PATH", dbPath)

	// Initialize the database
	if err := Initialize(); err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}

	// Return cleanup function
	return func() {
		Close()
		os.Remove(dbPath)
	}
}

func TestRecordMetric(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	event := MetricEvent{
		Endpoint:         "optimize",
		Success:          true,
		InputFormat:      "jpeg",
		OutputFormat:     "webp",
		BytesOriginal:    1000000,
		BytesOptimized:   500000,
		ProcessingTimeMs: 150,
		Timestamp:        time.Now(),
	}

	err := RecordMetric(event)
	if err != nil {
		t.Fatalf("Failed to record metric: %v", err)
	}

	// Verify the metric was recorded
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM metrics_hourly").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query metrics: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 metric record, got %d", count)
	}

	// Check format metrics
	err = DB.QueryRow("SELECT COUNT(*) FROM metrics_formats").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query format metrics: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 format record, got %d", count)
	}
}

func TestRecordMetricAggregation(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Record two metrics in the same hour
	now := time.Now()
	hourBucket := now.Truncate(time.Hour)

	event1 := MetricEvent{
		Endpoint:         "optimize",
		Success:          true,
		InputFormat:      "jpeg",
		OutputFormat:     "webp",
		BytesOriginal:    1000000,
		BytesOptimized:   500000,
		ProcessingTimeMs: 150,
		Timestamp:        hourBucket.Add(10 * time.Minute),
	}

	event2 := MetricEvent{
		Endpoint:         "optimize",
		Success:          true,
		InputFormat:      "png",
		OutputFormat:     "webp",
		BytesOriginal:    800000,
		BytesOptimized:   400000,
		ProcessingTimeMs: 200,
		Timestamp:        hourBucket.Add(20 * time.Minute),
	}

	if err := RecordMetric(event1); err != nil {
		t.Fatalf("Failed to record first metric: %v", err)
	}

	if err := RecordMetric(event2); err != nil {
		t.Fatalf("Failed to record second metric: %v", err)
	}

	// Verify aggregation - should only have 1 hourly record for the same endpoint
	var count, requestCount, totalBytesOriginal, totalBytesOptimized int64
	err := DB.QueryRow(`
		SELECT COUNT(*), SUM(request_count), SUM(total_bytes_original), SUM(total_bytes_optimized)
		FROM metrics_hourly
		WHERE endpoint = ?
	`, "optimize").Scan(&count, &requestCount, &totalBytesOriginal, &totalBytesOptimized)

	if err != nil {
		t.Fatalf("Failed to query aggregated metrics: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 aggregated record, got %d", count)
	}

	if requestCount != 2 {
		t.Errorf("Expected 2 total requests, got %d", requestCount)
	}

	if totalBytesOriginal != 1800000 {
		t.Errorf("Expected total original bytes 1800000, got %d", totalBytesOriginal)
	}

	if totalBytesOptimized != 900000 {
		t.Errorf("Expected total optimized bytes 900000, got %d", totalBytesOptimized)
	}

	// Check format metrics - should have 2 different format conversions
	err = DB.QueryRow("SELECT COUNT(*) FROM metrics_formats").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query format metrics: %v", err)
	}

	if count != 2 {
		t.Errorf("Expected 2 format conversion records, got %d", count)
	}
}

func TestGetMetricsSummary(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Record some test metrics
	now := time.Now()
	events := []MetricEvent{
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "webp",
			BytesOriginal:    1000000,
			BytesOptimized:   500000,
			ProcessingTimeMs: 150,
			Timestamp:        now.Add(-1 * time.Hour),
		},
		{
			Endpoint:         "batch-optimize",
			Success:          true,
			InputFormat:      "png",
			OutputFormat:     "webp",
			BytesOriginal:    800000,
			BytesOptimized:   400000,
			ProcessingTimeMs: 200,
			Timestamp:        now.Add(-2 * time.Hour),
		},
		{
			Endpoint:         "optimize",
			Success:          false,
			InputFormat:      "",
			OutputFormat:     "",
			BytesOriginal:    0,
			BytesOptimized:   0,
			ProcessingTimeMs: 50,
			Timestamp:        now.Add(-3 * time.Hour),
		},
	}

	for _, event := range events {
		if err := RecordMetric(event); err != nil {
			t.Fatalf("Failed to record metric: %v", err)
		}
	}

	// Get summary for the last 24 hours
	startTime := now.Add(-24 * time.Hour)
	endTime := now

	summary, err := GetMetricsSummary(startTime, endTime)
	if err != nil {
		t.Fatalf("Failed to get metrics summary: %v", err)
	}

	if summary.TotalRequests != 3 {
		t.Errorf("Expected 3 total requests, got %d", summary.TotalRequests)
	}

	if summary.SuccessfulRequests != 2 {
		t.Errorf("Expected 2 successful requests, got %d", summary.SuccessfulRequests)
	}

	if summary.FailedRequests != 1 {
		t.Errorf("Expected 1 failed request, got %d", summary.FailedRequests)
	}

	if summary.TotalBytesOriginal != 1800000 {
		t.Errorf("Expected total original bytes 1800000, got %d", summary.TotalBytesOriginal)
	}

	if summary.TotalBytesOptimized != 900000 {
		t.Errorf("Expected total optimized bytes 900000, got %d", summary.TotalBytesOptimized)
	}

	if summary.TotalBytesSaved != 900000 {
		t.Errorf("Expected total bytes saved 900000, got %d", summary.TotalBytesSaved)
	}

	expectedSavings := 50.0 // 900000 / 1800000 * 100
	if summary.AverageSavings < expectedSavings-0.1 || summary.AverageSavings > expectedSavings+0.1 {
		t.Errorf("Expected average savings around %.2f%%, got %.2f%%", expectedSavings, summary.AverageSavings)
	}
}

func TestGetFormatConversions(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Record format conversions
	now := time.Now()
	events := []MetricEvent{
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "webp",
			BytesOriginal:    1000000,
			BytesOptimized:   500000,
			ProcessingTimeMs: 150,
			Timestamp:        now,
		},
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "webp",
			BytesOriginal:    1200000,
			BytesOptimized:   600000,
			ProcessingTimeMs: 180,
			Timestamp:        now,
		},
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "png",
			OutputFormat:     "avif",
			BytesOriginal:    800000,
			BytesOptimized:   300000,
			ProcessingTimeMs: 200,
			Timestamp:        now,
		},
	}

	for _, event := range events {
		if err := RecordMetric(event); err != nil {
			t.Fatalf("Failed to record metric: %v", err)
		}
	}

	// Get format conversions
	startTime := now.Add(-1 * time.Hour)
	endTime := now.Add(1 * time.Hour)

	conversions, err := GetFormatConversions(startTime, endTime)
	if err != nil {
		t.Fatalf("Failed to get format conversions: %v", err)
	}

	if len(conversions) != 2 {
		t.Fatalf("Expected 2 format conversions, got %d", len(conversions))
	}

	// Check jpeg->webp conversion (should be first due to ordering by count DESC)
	jpegToWebp := conversions[0]
	if jpegToWebp.InputFormat != "jpeg" || jpegToWebp.OutputFormat != "webp" {
		t.Errorf("Expected jpeg->webp conversion first, got %s->%s", jpegToWebp.InputFormat, jpegToWebp.OutputFormat)
	}

	if jpegToWebp.ConversionCount != 2 {
		t.Errorf("Expected 2 jpeg->webp conversions, got %d", jpegToWebp.ConversionCount)
	}

	if jpegToWebp.TotalBytesOriginal != 2200000 {
		t.Errorf("Expected total original bytes 2200000, got %d", jpegToWebp.TotalBytesOriginal)
	}
}

func TestGetTimeSeriesData(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Record metrics across different hours
	baseTime := time.Now().Truncate(time.Hour)
	events := []MetricEvent{
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "webp",
			BytesOriginal:    1000000,
			BytesOptimized:   500000,
			ProcessingTimeMs: 150,
			Timestamp:        baseTime.Add(-2 * time.Hour),
		},
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "png",
			OutputFormat:     "webp",
			BytesOriginal:    800000,
			BytesOptimized:   400000,
			ProcessingTimeMs: 200,
			Timestamp:        baseTime.Add(-1 * time.Hour),
		},
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "avif",
			BytesOriginal:    1200000,
			BytesOptimized:   600000,
			ProcessingTimeMs: 180,
			Timestamp:        baseTime,
		},
	}

	for _, event := range events {
		if err := RecordMetric(event); err != nil {
			t.Fatalf("Failed to record metric: %v", err)
		}
	}

	// Get hourly time-series data
	startTime := baseTime.Add(-3 * time.Hour)
	endTime := baseTime.Add(1 * time.Hour)

	dataPoints, err := GetTimeSeriesData(startTime, endTime, "hour")
	if err != nil {
		t.Fatalf("Failed to get time-series data: %v", err)
	}

	if len(dataPoints) != 3 {
		t.Errorf("Expected 3 data points, got %d", len(dataPoints))
	}

	// Verify each data point has the expected structure
	for i, dp := range dataPoints {
		if dp.RequestCount != 1 {
			t.Errorf("Data point %d: Expected 1 request, got %d", i, dp.RequestCount)
		}

		if dp.SuccessCount != 1 {
			t.Errorf("Data point %d: Expected 1 success, got %d", i, dp.SuccessCount)
		}

		if dp.ErrorCount != 0 {
			t.Errorf("Data point %d: Expected 0 errors, got %d", i, dp.ErrorCount)
		}
	}
}

func TestCleanupOldMetrics(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Record metrics with different timestamps
	now := time.Now()
	events := []MetricEvent{
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "webp",
			BytesOriginal:    1000000,
			BytesOptimized:   500000,
			ProcessingTimeMs: 150,
			Timestamp:        now.AddDate(0, 0, -40), // 40 days ago
		},
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "png",
			OutputFormat:     "webp",
			BytesOriginal:    800000,
			BytesOptimized:   400000,
			ProcessingTimeMs: 200,
			Timestamp:        now.AddDate(0, 0, -10), // 10 days ago
		},
		{
			Endpoint:         "optimize",
			Success:          true,
			InputFormat:      "jpeg",
			OutputFormat:     "avif",
			BytesOriginal:    1200000,
			BytesOptimized:   600000,
			ProcessingTimeMs: 180,
			Timestamp:        now, // Today
		},
	}

	for _, event := range events {
		if err := RecordMetric(event); err != nil {
			t.Fatalf("Failed to record metric: %v", err)
		}
	}

	// Clean up metrics older than 30 days
	if err := CleanupOldMetrics(30); err != nil {
		t.Fatalf("Failed to cleanup old metrics: %v", err)
	}

	// Verify old metrics were deleted
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM metrics_hourly").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query metrics after cleanup: %v", err)
	}

	if count != 2 {
		t.Errorf("Expected 2 metrics remaining after cleanup, got %d", count)
	}

	// Verify format metrics were also cleaned up
	err = DB.QueryRow("SELECT COUNT(*) FROM metrics_formats").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query format metrics after cleanup: %v", err)
	}

	if count != 2 {
		t.Errorf("Expected 2 format metrics remaining after cleanup, got %d", count)
	}
}

func TestRecordMetricWithAPIKey(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Create an API key first
	apiKey, err := CreateAPIKey("Test Key")
	if err != nil {
		t.Fatalf("Failed to create API key: %v", err)
	}

	// Record a metric with API key
	event := MetricEvent{
		Endpoint:         "optimize",
		Success:          true,
		InputFormat:      "jpeg",
		OutputFormat:     "webp",
		BytesOriginal:    1000000,
		BytesOptimized:   500000,
		ProcessingTimeMs: 150,
		APIKeyID:         &apiKey.ID,
		Timestamp:        time.Now(),
	}

	if err := RecordMetric(event); err != nil {
		t.Fatalf("Failed to record metric with API key: %v", err)
	}

	// Verify API key metrics were recorded
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM metrics_api_keys WHERE api_key_id = ?", apiKey.ID).Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query API key metrics: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 API key metric record, got %d", count)
	}
}

func TestGetTimeSeriesDataInvalidInterval(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	now := time.Now()
	startTime := now.Add(-24 * time.Hour)

	_, err := GetTimeSeriesData(startTime, now, "invalid")
	if err == nil {
		t.Error("Expected error for invalid interval, got nil")
	}
}
