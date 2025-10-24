package db

import (
	"database/sql"
	"fmt"
	"time"
)

// MetricEvent represents a single optimization event to be recorded
type MetricEvent struct {
	Endpoint        string
	Success         bool
	InputFormat     string
	OutputFormat    string
	BytesOriginal   int64
	BytesOptimized  int64
	ProcessingTimeMs int64
	APIKeyID        *int
	Timestamp       time.Time
}

// MetricsSummary represents aggregated metrics
type MetricsSummary struct {
	TotalRequests       int64   `json:"total_requests"`
	SuccessfulRequests  int64   `json:"successful_requests"`
	FailedRequests      int64   `json:"failed_requests"`
	TotalBytesOriginal  int64   `json:"total_bytes_original"`
	TotalBytesOptimized int64   `json:"total_bytes_optimized"`
	TotalBytesSaved     int64   `json:"total_bytes_saved"`
	AverageSavings      float64 `json:"average_savings_percent"`
	AvgProcessingTimeMs float64 `json:"avg_processing_time_ms"`
}

// FormatConversion represents format conversion statistics
type FormatConversion struct {
	InputFormat         string  `json:"input_format"`
	OutputFormat        string  `json:"output_format"`
	ConversionCount     int64   `json:"conversion_count"`
	TotalBytesOriginal  int64   `json:"total_bytes_original"`
	TotalBytesOptimized int64   `json:"total_bytes_optimized"`
	TotalBytesSaved     int64   `json:"total_bytes_saved"`
	AverageSavings      float64 `json:"average_savings_percent"`
}

// TimeSeriesDataPoint represents a single point in time-series data
type TimeSeriesDataPoint struct {
	Timestamp           string  `json:"timestamp"`
	RequestCount        int64   `json:"request_count"`
	SuccessCount        int64   `json:"success_count"`
	ErrorCount          int64   `json:"error_count"`
	BytesOriginal       int64   `json:"bytes_original"`
	BytesOptimized      int64   `json:"bytes_optimized"`
	BytesSaved          int64   `json:"bytes_saved"`
	AvgProcessingTimeMs float64 `json:"avg_processing_time_ms"`
}

// RecordMetric records a metric event by updating hourly aggregates
func RecordMetric(event MetricEvent) error {
	// Round timestamp to the hour
	hourBucket := event.Timestamp.Truncate(time.Hour)

	// Start a transaction
	tx, err := DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Update metrics_hourly
	if err := recordHourlyMetric(tx, hourBucket, event); err != nil {
		return err
	}

	// Update metrics_formats if format info is provided
	if event.InputFormat != "" && event.OutputFormat != "" {
		if err := recordFormatMetric(tx, hourBucket, event); err != nil {
			return err
		}
	}

	// Update metrics_api_keys if API key is provided
	if event.APIKeyID != nil {
		if err := recordAPIKeyMetric(tx, hourBucket, event); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// recordHourlyMetric updates the hourly metrics aggregate
func recordHourlyMetric(tx *sql.Tx, hourBucket time.Time, event MetricEvent) error {
	successCount := 0
	errorCount := 0
	if event.Success {
		successCount = 1
	} else {
		errorCount = 1
	}

	query := `
		INSERT INTO metrics_hourly
			(timestamp, endpoint, request_count, success_count, error_count,
			 total_bytes_original, total_bytes_optimized, total_processing_time_ms, updated_at)
		VALUES (?, ?, 1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(timestamp, endpoint) DO UPDATE SET
			request_count = request_count + 1,
			success_count = success_count + ?,
			error_count = error_count + ?,
			total_bytes_original = total_bytes_original + ?,
			total_bytes_optimized = total_bytes_optimized + ?,
			total_processing_time_ms = total_processing_time_ms + ?,
			updated_at = CURRENT_TIMESTAMP
	`

	_, err := tx.Exec(query,
		hourBucket, event.Endpoint, successCount, errorCount,
		event.BytesOriginal, event.BytesOptimized, event.ProcessingTimeMs,
		successCount, errorCount,
		event.BytesOriginal, event.BytesOptimized, event.ProcessingTimeMs,
	)

	if err != nil {
		return fmt.Errorf("failed to record hourly metric: %w", err)
	}

	return nil
}

// recordFormatMetric updates the format conversion metrics
func recordFormatMetric(tx *sql.Tx, hourBucket time.Time, event MetricEvent) error {
	query := `
		INSERT INTO metrics_formats
			(timestamp, input_format, output_format, conversion_count,
			 total_bytes_original, total_bytes_optimized, updated_at)
		VALUES (?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(timestamp, input_format, output_format) DO UPDATE SET
			conversion_count = conversion_count + 1,
			total_bytes_original = total_bytes_original + ?,
			total_bytes_optimized = total_bytes_optimized + ?,
			updated_at = CURRENT_TIMESTAMP
	`

	_, err := tx.Exec(query,
		hourBucket, event.InputFormat, event.OutputFormat,
		event.BytesOriginal, event.BytesOptimized,
		event.BytesOriginal, event.BytesOptimized,
	)

	if err != nil {
		return fmt.Errorf("failed to record format metric: %w", err)
	}

	return nil
}

// recordAPIKeyMetric updates the API key usage metrics
func recordAPIKeyMetric(tx *sql.Tx, hourBucket time.Time, event MetricEvent) error {
	successCount := 0
	errorCount := 0
	if event.Success {
		successCount = 1
	} else {
		errorCount = 1
	}

	query := `
		INSERT INTO metrics_api_keys
			(timestamp, api_key_id, request_count, success_count, error_count, updated_at)
		VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(timestamp, api_key_id) DO UPDATE SET
			request_count = request_count + 1,
			success_count = success_count + ?,
			error_count = error_count + ?,
			updated_at = CURRENT_TIMESTAMP
	`

	_, err := tx.Exec(query,
		hourBucket, *event.APIKeyID, successCount, errorCount,
		successCount, errorCount,
	)

	if err != nil {
		return fmt.Errorf("failed to record API key metric: %w", err)
	}

	return nil
}

// GetMetricsSummary retrieves aggregated metrics for a given time range
func GetMetricsSummary(startTime, endTime time.Time) (*MetricsSummary, error) {
	query := `
		SELECT
			COALESCE(SUM(request_count), 0) as total_requests,
			COALESCE(SUM(success_count), 0) as successful_requests,
			COALESCE(SUM(error_count), 0) as failed_requests,
			COALESCE(SUM(total_bytes_original), 0) as total_bytes_original,
			COALESCE(SUM(total_bytes_optimized), 0) as total_bytes_optimized,
			COALESCE(SUM(total_processing_time_ms), 0) as total_processing_time_ms,
			COALESCE(SUM(request_count), 0) as total_count
		FROM metrics_hourly
		WHERE timestamp >= ? AND timestamp < ?
	`

	var summary MetricsSummary
	var totalProcessingTime int64
	var totalCount int64

	err := DB.QueryRow(query, startTime, endTime).Scan(
		&summary.TotalRequests,
		&summary.SuccessfulRequests,
		&summary.FailedRequests,
		&summary.TotalBytesOriginal,
		&summary.TotalBytesOptimized,
		&totalProcessingTime,
		&totalCount,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to query metrics summary: %w", err)
	}

	// Calculate derived metrics
	summary.TotalBytesSaved = summary.TotalBytesOriginal - summary.TotalBytesOptimized
	if summary.TotalBytesOriginal > 0 {
		summary.AverageSavings = float64(summary.TotalBytesSaved) / float64(summary.TotalBytesOriginal) * 100
	}
	if totalCount > 0 {
		summary.AvgProcessingTimeMs = float64(totalProcessingTime) / float64(totalCount)
	}

	return &summary, nil
}

// GetFormatConversions retrieves format conversion statistics
func GetFormatConversions(startTime, endTime time.Time) ([]FormatConversion, error) {
	query := `
		SELECT
			input_format,
			output_format,
			SUM(conversion_count) as conversion_count,
			SUM(total_bytes_original) as total_bytes_original,
			SUM(total_bytes_optimized) as total_bytes_optimized
		FROM metrics_formats
		WHERE timestamp >= ? AND timestamp < ?
		GROUP BY input_format, output_format
		ORDER BY conversion_count DESC
	`

	rows, err := DB.Query(query, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("failed to query format conversions: %w", err)
	}
	defer rows.Close()

	var conversions []FormatConversion
	for rows.Next() {
		var conv FormatConversion
		if err := rows.Scan(
			&conv.InputFormat,
			&conv.OutputFormat,
			&conv.ConversionCount,
			&conv.TotalBytesOriginal,
			&conv.TotalBytesOptimized,
		); err != nil {
			return nil, fmt.Errorf("failed to scan format conversion row: %w", err)
		}

		// Calculate derived metrics
		conv.TotalBytesSaved = conv.TotalBytesOriginal - conv.TotalBytesOptimized
		if conv.TotalBytesOriginal > 0 {
			conv.AverageSavings = float64(conv.TotalBytesSaved) / float64(conv.TotalBytesOriginal) * 100
		}

		conversions = append(conversions, conv)
	}

	return conversions, nil
}

// GetTimeSeriesData retrieves time-series data for a given time range and interval
func GetTimeSeriesData(startTime, endTime time.Time, interval string) ([]TimeSeriesDataPoint, error) {
	// Validate interval
	if interval != "hour" && interval != "day" {
		return nil, fmt.Errorf("invalid interval: must be 'hour' or 'day'")
	}

	var query string
	if interval == "hour" {
		query = `
			SELECT
				timestamp,
				SUM(request_count) as request_count,
				SUM(success_count) as success_count,
				SUM(error_count) as error_count,
				SUM(total_bytes_original) as bytes_original,
				SUM(total_bytes_optimized) as bytes_optimized,
				SUM(total_processing_time_ms) as total_processing_time,
				SUM(request_count) as total_count
			FROM metrics_hourly
			WHERE timestamp >= ? AND timestamp < ?
			GROUP BY timestamp
			ORDER BY timestamp ASC
		`
	} else {
		// Daily aggregation
		query = `
			SELECT
				DATE(timestamp) as timestamp,
				SUM(request_count) as request_count,
				SUM(success_count) as success_count,
				SUM(error_count) as error_count,
				SUM(total_bytes_original) as bytes_original,
				SUM(total_bytes_optimized) as bytes_optimized,
				SUM(total_processing_time_ms) as total_processing_time,
				SUM(request_count) as total_count
			FROM metrics_hourly
			WHERE timestamp >= ? AND timestamp < ?
			GROUP BY DATE(timestamp)
			ORDER BY DATE(timestamp) ASC
		`
	}

	rows, err := DB.Query(query, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("failed to query time series data: %w", err)
	}
	defer rows.Close()

	var dataPoints []TimeSeriesDataPoint
	for rows.Next() {
		var dp TimeSeriesDataPoint
		var totalProcessingTime int64
		var totalCount int64

		if err := rows.Scan(
			&dp.Timestamp,
			&dp.RequestCount,
			&dp.SuccessCount,
			&dp.ErrorCount,
			&dp.BytesOriginal,
			&dp.BytesOptimized,
			&totalProcessingTime,
			&totalCount,
		); err != nil {
			return nil, fmt.Errorf("failed to scan time series row: %w", err)
		}

		// Calculate derived metrics
		dp.BytesSaved = dp.BytesOriginal - dp.BytesOptimized
		if totalCount > 0 {
			dp.AvgProcessingTimeMs = float64(totalProcessingTime) / float64(totalCount)
		}

		dataPoints = append(dataPoints, dp)
	}

	return dataPoints, nil
}

// CleanupOldMetrics deletes metrics older than the specified retention period
func CleanupOldMetrics(retentionDays int) error {
	cutoffTime := time.Now().AddDate(0, 0, -retentionDays)

	tx, err := DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete old hourly metrics
	if _, err := tx.Exec("DELETE FROM metrics_hourly WHERE timestamp < ?", cutoffTime); err != nil {
		return fmt.Errorf("failed to delete old hourly metrics: %w", err)
	}

	// Delete old format metrics
	if _, err := tx.Exec("DELETE FROM metrics_formats WHERE timestamp < ?", cutoffTime); err != nil {
		return fmt.Errorf("failed to delete old format metrics: %w", err)
	}

	// Delete old API key metrics
	if _, err := tx.Exec("DELETE FROM metrics_api_keys WHERE timestamp < ?", cutoffTime); err != nil {
		return fmt.Errorf("failed to delete old API key metrics: %w", err)
	}

	return tx.Commit()
}
