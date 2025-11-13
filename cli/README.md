# imgopt CLI

The `imgopt` CLI lets you batch optimize images against a local or remote Squish API server.

## Build

```bash
cd cli
go build -o imgopt imgopt.go

# Optional: install globally
sudo mv imgopt /usr/local/bin/
```

## Usage

```bash
imgopt [options] <file1> [file2] [...]
```

Key flags:

- `-quality <1-100>` — compression quality (default `80`)
- `-width`, `-height` — resize while keeping aspect ratio (0 = keep original)
- `-format <jpeg|png|webp|avif|gif>`
- `-output <dir>` — destination directory (default: alongside source file)
- `-api <url>` — API endpoint (default: `http://localhost:8080/optimize`)
- `-config <path>` — override config file path
- `-v`/`-version`, `-h`/`-help` for metadata

## Configuration File

Provide defaults in `.imgoptrc` (YAML). Search order:

1. Project root `./.imgoptrc`
2. User home `~/.imgoptrc`
3. Custom path via `-config`

CLI flags override file values.

```yaml
quality: 85
format: webp
output: optimized/
api: http://localhost:8080/optimize
```

See `cli/.imgoptrc.example` for every option.

## Examples

```bash
imgopt photo.jpg                          # basic optimization
imgopt -quality=90 -format=webp photo.jpg # convert to WebP
imgopt -width=800 -height=600 photo.jpg   # resize + optimize
imgopt -format=webp *.jpg                 # batch glob
imgopt -output=optimized/ img/*.png       # custom output directory
imgopt -config=project.imgoptrc *.jpg     # custom config file
```

## Output

Optimized files get the `-optimized` suffix unless `-output` is set:

- `photo.jpg` → `photo-optimized.webp`
- `image.png` → `image-optimized.png`

Sample run:

```text
Optimizing 3 file(s)...
[1/3] Processing photo1.jpg... ✓ Saved 74.91% (32ms)
[2/3] Processing photo2.png... ✓ Saved 10.91% (47ms)
[3/3] Processing photo3.jpg... ✓ Saved 83.35% (9ms)

Files processed: 3   Successful: 3   Failed: 0
Total savings: 72.43%   Total processing time: 88ms
```
