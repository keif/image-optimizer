package main

import (
	"bytes"
	"flag"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	apiURL     = "http://localhost:8080/optimize"
	version    = "1.0.0"
	defaultQuality = 80
)

// Config holds CLI configuration
type Config struct {
	Quality      int
	Width        int
	Height       int
	Format       string
	Output       string
	APIEndpoint  string
	ShowVersion  bool
	ShowHelp     bool
	Files        []string
}

// OptimizeResult represents the optimization statistics
type OptimizeResult struct {
	Filename       string
	Success        bool
	Error          string
	OriginalSize   int64
	OptimizedSize  int64
	Savings        string
	ProcessingTime time.Duration
}

func main() {
	config := parseFlags()

	if config.ShowVersion {
		fmt.Printf("imgopt version %s\n", version)
		os.Exit(0)
	}

	if config.ShowHelp || len(config.Files) == 0 {
		printUsage()
		os.Exit(0)
	}

	// Validate files exist
	validFiles := []string{}
	for _, file := range config.Files {
		if _, err := os.Stat(file); err == nil {
			validFiles = append(validFiles, file)
		} else {
			fmt.Fprintf(os.Stderr, "Warning: File not found: %s\n", file)
		}
	}

	if len(validFiles) == 0 {
		fmt.Fprintln(os.Stderr, "Error: No valid files to process")
		os.Exit(1)
	}

	// Check if API is available
	if !checkAPIAvailability(config.APIEndpoint) {
		fmt.Fprintf(os.Stderr, "Error: Cannot connect to API at %s\n", config.APIEndpoint)
		fmt.Fprintln(os.Stderr, "Please ensure the image-optimizer API is running.")
		os.Exit(1)
	}

	// Process files
	fmt.Printf("Optimizing %d file(s)...\n\n", len(validFiles))
	results := []OptimizeResult{}

	for i, file := range validFiles {
		fmt.Printf("[%d/%d] Processing %s... ", i+1, len(validFiles), filepath.Base(file))
		result := optimizeFile(file, config)
		results = append(results, result)

		if result.Success {
			fmt.Printf("✓ Saved %s (%.2f%% reduction, %s)\n",
				getSavingsDisplay(result.Savings),
				calculatePercentage(result.Savings),
				result.ProcessingTime)
		} else {
			fmt.Printf("✗ Failed: %s\n", result.Error)
		}
	}

	// Print summary
	printSummary(results)
}

// parseFlags parses command-line flags and returns configuration
func parseFlags() Config {
	config := Config{}

	flag.IntVar(&config.Quality, "quality", defaultQuality, "Quality level (1-100)")
	flag.IntVar(&config.Width, "width", 0, "Target width in pixels (0 = no resize)")
	flag.IntVar(&config.Height, "height", 0, "Target height in pixels (0 = no resize)")
	flag.StringVar(&config.Format, "format", "", "Output format (jpeg, png, webp, gif)")
	flag.StringVar(&config.Output, "output", "", "Output directory (default: same as input)")
	flag.StringVar(&config.APIEndpoint, "api", apiURL, "API endpoint URL")
	flag.BoolVar(&config.ShowVersion, "version", false, "Show version information")
	flag.BoolVar(&config.ShowVersion, "v", false, "Show version information (shorthand)")
	flag.BoolVar(&config.ShowHelp, "help", false, "Show help message")
	flag.BoolVar(&config.ShowHelp, "h", false, "Show help message (shorthand)")

	flag.Parse()

	// Remaining arguments are files
	config.Files = flag.Args()

	return config
}

// printUsage prints usage information
func printUsage() {
	fmt.Println("imgopt - Image Optimization CLI")
	fmt.Printf("Version: %s\n\n", version)
	fmt.Println("Usage: imgopt [options] <file1> [file2] [file3] ...")
	fmt.Println("\nOptions:")
	flag.PrintDefaults()
	fmt.Println("\nExamples:")
	fmt.Println("  imgopt photo.jpg")
	fmt.Println("  imgopt -quality=90 -format=webp photo.jpg")
	fmt.Println("  imgopt -width=800 -height=600 *.jpg")
	fmt.Println("  imgopt -output=optimized/ photo1.jpg photo2.png")
}

// checkAPIAvailability checks if the API is reachable
func checkAPIAvailability(endpoint string) bool {
	healthURL := strings.TrimSuffix(endpoint, "/optimize") + "/health"
	client := &http.Client{Timeout: 2 * time.Second}

	resp, err := client.Get(healthURL)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK
}

// optimizeFile processes a single file
func optimizeFile(filePath string, config Config) OptimizeResult {
	startTime := time.Now()
	result := OptimizeResult{
		Filename: filepath.Base(filePath),
	}

	// Get original file size
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		result.Error = fmt.Sprintf("cannot read file: %v", err)
		return result
	}
	result.OriginalSize = fileInfo.Size()

	// Open file
	file, err := os.Open(filePath)
	if err != nil {
		result.Error = fmt.Sprintf("cannot open file: %v", err)
		return result
	}
	defer file.Close()

	// Build API request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Detect content type from file extension
	contentType := getContentType(filePath)

	// Create form field with proper content type
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{fmt.Sprintf(`form-data; name="image"; filename="%s"`, filepath.Base(filePath))}
	h["Content-Type"] = []string{contentType}

	part, err := writer.CreatePart(h)
	if err != nil {
		result.Error = fmt.Sprintf("cannot create form file: %v", err)
		return result
	}

	_, err = io.Copy(part, file)
	if err != nil {
		result.Error = fmt.Sprintf("cannot copy file data: %v", err)
		return result
	}

	writer.Close()

	// Build URL with query parameters
	url := config.APIEndpoint + "?returnImage=true"
	if config.Quality != defaultQuality {
		url += fmt.Sprintf("&quality=%d", config.Quality)
	}
	if config.Width > 0 {
		url += fmt.Sprintf("&width=%d", config.Width)
	}
	if config.Height > 0 {
		url += fmt.Sprintf("&height=%d", config.Height)
	}
	if config.Format != "" {
		url += fmt.Sprintf("&format=%s", config.Format)
	}

	// Make API request
	client := &http.Client{Timeout: 60 * time.Second}
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		result.Error = fmt.Sprintf("cannot create request: %v", err)
		return result
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := client.Do(req)
	if err != nil {
		result.Error = fmt.Sprintf("API request failed: %v", err)
		return result
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		result.Error = fmt.Sprintf("API error (status %d): %s", resp.StatusCode, string(bodyBytes))
		return result
	}

	// Read optimized image
	optimizedData, err := io.ReadAll(resp.Body)
	if err != nil {
		result.Error = fmt.Sprintf("cannot read response: %v", err)
		return result
	}
	result.OptimizedSize = int64(len(optimizedData))

	// Determine output path
	outputPath := getOutputPath(filePath, config)

	// Ensure output directory exists
	outputDir := filepath.Dir(outputPath)
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		result.Error = fmt.Sprintf("cannot create output directory: %v", err)
		return result
	}

	// Write optimized file
	err = os.WriteFile(outputPath, optimizedData, 0644)
	if err != nil {
		result.Error = fmt.Sprintf("cannot write output file: %v", err)
		return result
	}

	// Calculate statistics
	result.Success = true
	result.ProcessingTime = time.Since(startTime)
	savingsPercent := float64(result.OriginalSize-result.OptimizedSize) / float64(result.OriginalSize) * 100
	if savingsPercent < 0 {
		savingsPercent = 0
	}
	result.Savings = fmt.Sprintf("%.2f%%", savingsPercent)

	return result
}

// getOutputPath determines the output file path
func getOutputPath(inputPath string, config Config) string {
	dir := filepath.Dir(inputPath)
	base := filepath.Base(inputPath)
	ext := filepath.Ext(base)
	nameWithoutExt := strings.TrimSuffix(base, ext)

	// Determine output extension
	outputExt := ext
	if config.Format != "" {
		switch config.Format {
		case "jpeg", "jpg":
			outputExt = ".jpg"
		case "png":
			outputExt = ".png"
		case "webp":
			outputExt = ".webp"
		case "gif":
			outputExt = ".gif"
		}
	}

	// Use specified output directory or same directory as input
	if config.Output != "" {
		dir = config.Output
	}

	return filepath.Join(dir, nameWithoutExt+"-optimized"+outputExt)
}

// getSavingsDisplay formats savings for display
func getSavingsDisplay(savings string) string {
	return savings
}

// calculatePercentage extracts percentage from savings string
func calculatePercentage(savings string) float64 {
	var percent float64
	fmt.Sscanf(savings, "%f%%", &percent)
	return percent
}

// printSummary prints optimization summary
func printSummary(results []OptimizeResult) {
	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("Optimization Summary")
	fmt.Println(strings.Repeat("=", 60))

	successCount := 0
	var totalOriginal, totalOptimized int64
	var totalTime time.Duration

	for _, result := range results {
		if result.Success {
			successCount++
			totalOriginal += result.OriginalSize
			totalOptimized += result.OptimizedSize
			totalTime += result.ProcessingTime
		}
	}

	fmt.Printf("Files processed: %d\n", len(results))
	fmt.Printf("Successful: %d\n", successCount)
	fmt.Printf("Failed: %d\n", len(results)-successCount)

	if totalOriginal > 0 {
		totalSavings := float64(totalOriginal-totalOptimized) / float64(totalOriginal) * 100
		if totalSavings < 0 {
			totalSavings = 0
		}
		fmt.Printf("\nTotal original size: %s\n", formatBytes(totalOriginal))
		fmt.Printf("Total optimized size: %s\n", formatBytes(totalOptimized))
		fmt.Printf("Total savings: %.2f%%\n", totalSavings)
		fmt.Printf("Total processing time: %s\n", totalTime.Round(time.Millisecond))
	}

	fmt.Println(strings.Repeat("=", 60))
}

// formatBytes formats bytes into human-readable format
func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// getContentType returns the MIME type based on file extension
func getContentType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	default:
		return "application/octet-stream"
	}
}
