# Testing Guide

## Running Tests

### Run All Tests

```bash
go test ./...
```

### Run Tests with Verbose Output

```bash
go test -v ./...
```

### Run Specific Test

```bash
go test -v -run TestName ./package/
```

Example:

```bash
go test -v -run TestPreserveFrameOrder ./services/
```

### Run Tests for Specific Package

```bash
go test ./services/
go test ./routes/
go test ./middleware/
go test ./db/
```

## Test Coverage

### Generate Coverage Report

```bash
# Run tests and generate coverage profile
go test -coverprofile=coverage.out ./...

# View coverage summary by package
go test -cover ./...

# Generate HTML coverage report
go tool cover -html=coverage.out -o coverage.html

# Open in browser (macOS)
open coverage.html

# Open in browser (Linux)
xdg-open coverage.html
```

### View Coverage in Terminal

```bash
# Show coverage percentage for each package
go test -cover ./...

# Show coverage for specific package
go test -cover ./services/

# Show detailed function-level coverage
go tool cover -func=coverage.out
```

### Current Coverage by Package

As of the latest run:

- **services**: 60.6% coverage
- **db**: 58.0% coverage
- **middleware**: 48.7% coverage
- **routes**: 35.7% coverage

### Coverage Interpretation

The HTML coverage report uses color coding:

- **Green**: Code is covered by tests
- **Red**: Code is not covered by tests
- **Gray**: Code that cannot be covered (comments, package declarations)

### Improving Coverage

To improve test coverage:

1. **Identify uncovered code**: Open `coverage.html` and look for red sections
2. **Write tests for uncovered paths**: Focus on:
   - Error handling branches
   - Edge cases
   - Conditional logic
3. **Run coverage again**: Verify new tests increase coverage

Example workflow:

```bash
# Generate coverage report
go test -coverprofile=coverage.out ./services/

# View which functions need tests
go tool cover -func=coverage.out | grep services | sort -k3 -n

# Generate HTML to see specific lines
go tool cover -html=coverage.out -o coverage.html
open coverage.html
```

## Integration Tests

### API Integration Tests

The `test-fixes.sh` script runs integration tests against a running server:

```bash
# Start server with public access enabled
PUBLIC_OPTIMIZATION_ENABLED=true ./imgopt &

# Run integration tests
bash ./test-fixes.sh
```

Tests covered:

1. ✅ Dynamic imagePath parameter
2. ✅ Smart packing modes (optimal, smart, preserve)
3. ✅ PowerOfTwo dimension capping
4. ✅ Compression warnings

### Manual API Testing

```bash
# Start server
./imgopt &

# Test spritesheet packing
curl -X POST "http://localhost:8080/pack-sprites" \
  -F "images=@testdata/sprite1.png" \
  -F "images=@testdata/sprite2.png" \
  -F "maxWidth=2048" \
  -F "maxHeight=2048" \
  -F "powerOfTwo=true"

# Test spritesheet optimization
curl -X POST "http://localhost:8080/optimize-spritesheet" \
  -F "spritesheet=@testdata/sheet.png" \
  -F "xml=@testdata/sheet.xml" \
  -F "outputFormats=sparrow"
```

## Test Structure

### Unit Tests

Located in `*_test.go` files alongside source code:

- `services/spritesheet_service_test.go`
- `services/image_service_test.go`
- `routes/optimize_test.go`
- `routes/security_test.go`
- `middleware/*_test.go`
- `db/*_test.go`

### Test Data

Located in `testdata/` directory:

- `testdata/spritesheets/` - Test spritesheet images and XML files
- `testdata/images/` - Test images for optimization

### Test Conventions

1. **Test naming**: `Test<FunctionName>` or `Test<Feature>`
2. **Table-driven tests**: Use test tables for multiple scenarios
3. **Subtests**: Use `t.Run()` for related test cases
4. **Test helpers**: Create helper functions in `*_test.go` files

Example:

```go
func TestSpritesheet Packing(t *testing.T) {
    tests := []struct {
        name     string
        sprites  []Sprite
        options  PackingOptions
        wantErr  bool
    }{
        {
            name: "small sprites with power of 2",
            sprites: createTestSprites(4, 100, 100),
            options: PackingOptions{
                PowerOfTwo: true,
                MaxWidth:   2048,
                MaxHeight:  2048,
            },
            wantErr: false,
        },
        // ... more test cases
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result, err := PackSprites(tt.sprites, tt.options)
            if (err != nil) != tt.wantErr {
                t.Errorf("PackSprites() error = %v, wantErr %v", err, tt.wantErr)
            }
            // ... assertions
        })
    }
}
```

## Continuous Integration

Tests run automatically on:

- Git pre-commit hook (via `.husky/pre-commit`)
- GitHub Actions (if configured)
- Manual runs before merging

## Best Practices

1. **Run tests before committing**:

   ```bash
   go test ./...
   ```

2. **Check coverage for new features**:

   ```bash
   go test -coverprofile=coverage.out ./services/
   go tool cover -func=coverage.out | grep "NewFunction"
   ```

3. **Test edge cases**:
   - Empty inputs
   - Maximum values
   - Invalid inputs
   - Concurrent access

4. **Use meaningful test names**:

   ```go
   // Good
   func TestPackSprites_WithPowerOfTwo_CapsAtMaxDimensions(t *testing.T)

   // Bad
   func TestPacking(t *testing.T)
   ```

5. **Clean up test resources**:

   ```go
   func TestWithTempFile(t *testing.T) {
       tmpfile, err := os.CreateTemp("", "test")
       if err != nil {
           t.Fatal(err)
       }
       defer os.Remove(tmpfile.Name()) // Clean up

       // ... test code
   }
   ```

## Benchmarking

```bash
# Run benchmarks
go test -bench=. ./services/

# Run benchmarks with memory stats
go test -bench=. -benchmem ./services/

# Run specific benchmark
go test -bench=BenchmarkPackSprites ./services/
```

## Debugging Tests

```bash
# Run with race detector
go test -race ./...

# Run with verbose output and test a specific function
go test -v -run TestSpecificFunction ./services/

# Print test output even on success
go test -v ./services/ 2>&1 | tee test-output.log
```

## Coverage Goals

Target coverage by package:

- **Critical paths** (packing, optimization): ≥80%
- **API routes**: ≥70%
- **Middleware**: ≥60%
- **Utilities**: ≥50%

Focus on testing:

- Happy paths
- Error conditions
- Edge cases
- Security-critical code
