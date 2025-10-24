# Pre-Commit Hooks Guide

## What Are Pre-Commit Hooks?

Pre-commit hooks automatically check your code **before** you commit, catching issues like:
- Linting errors
- Formatting issues
- Trailing whitespace
- Large files
- Secrets/credentials
- TypeScript errors

This prevents bad code from entering the repository and failing CI.

## Quick Setup

```bash
./setup-hooks.sh
```

That's it! The script will:
1. Install pre-commit (if needed)
2. Install Git hooks
3. Generate secrets baseline
4. Test hooks on all files

## Manual Setup

If you prefer to set up manually:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Generate secrets baseline
detect-secrets scan > .secrets.baseline

# Test
pre-commit run --all-files
```

## What Gets Checked

### On Every Commit
- ✅ **Go API** - golangci-lint with auto-fix
- ✅ **Frontend** - ESLint + TypeScript checks
- ✅ **Markdown** - markdownlint for docs
- ✅ **General** - trailing whitespace, line endings, merge conflicts
- ✅ **Secrets** - detect hardcoded credentials

### Auto-Fixes
Many issues are automatically fixed:
- Trailing whitespace removed
- Line endings normalized to LF
- Go code formatted with `gofmt` and `goimports`
- Markdown formatting issues
- ESLint auto-fixable issues

## Usage

### Normal Workflow
```bash
git add .
git commit -m "feat: your changes"
# Hooks run automatically!
```

### Run Manually (Without Committing)
```bash
pre-commit run --all-files     # Check all files
pre-commit run --files file.go # Check specific file
```

### Skip Hooks (Emergency Only)
```bash
git commit --no-verify -m "emergency fix"
```

**⚠️ Warning:** Only skip hooks if absolutely necessary. CI will catch the issues anyway.

### Update Hooks
```bash
pre-commit autoupdate  # Update hook versions
```

## What Happens on Commit?

1. You run `git commit`
2. Pre-commit hooks run automatically
3. If issues found:
   - Auto-fixable issues are fixed automatically
   - Non-auto-fixable issues cause commit to fail
   - You fix the issues and commit again
4. If all checks pass:
   - Commit succeeds! ✅

## Performance

- **First run**: ~30-60 seconds (installs dependencies)
- **Subsequent runs**: ~5-15 seconds (only checks changed files)
- **--all-files**: ~30-45 seconds (full project scan)

## Troubleshooting

### "command not found: pre-commit"
```bash
pip install pre-commit
# or
pip3 install pre-commit
```

### "golangci-lint: command not found"
```bash
brew install golangci-lint
```

### "detect-secrets: command not found"
```bash
pip install detect-secrets
```

### Hooks Not Running
```bash
# Reinstall hooks
pre-commit uninstall
pre-commit install
```

### Skip a Specific Hook
```bash
SKIP=eslint git commit -m "skip eslint"
```

## Configuration

Edit `.pre-commit-config.yaml` to:
- Add/remove hooks
- Change hook versions
- Modify hook arguments
- Exclude files/directories

## CI Integration

Pre-commit hooks run **locally** before commit.
GitHub Actions runs the same checks on **every push/PR**.

This provides two layers of quality control:
1. **Local** - Fast feedback before commit
2. **CI** - Catches anything that slips through

## Best Practices

1. ✅ **Run hooks before committing** - Let them catch issues early
2. ✅ **Don't skip hooks** - They're there to help you
3. ✅ **Fix issues immediately** - Don't accumulate tech debt
4. ✅ **Update hooks regularly** - `pre-commit autoupdate`
5. ❌ **Don't commit with --no-verify** - CI will fail anyway

## Files Created

- `.pre-commit-config.yaml` - Hook configuration
- `.secrets.baseline` - Known secrets (for detect-secrets)
- `.git/hooks/pre-commit` - Git hook script (auto-generated)
- `setup-hooks.sh` - Easy setup script
- `PRE_COMMIT_GUIDE.md` - This guide

## Learn More

- [Pre-commit Documentation](https://pre-commit.com/)
- [Available Hooks](https://pre-commit.com/hooks.html)
- [Writing Custom Hooks](https://pre-commit.com/#creating-new-hooks)
