#!/bin/bash

# Setup script for pre-commit hooks
# This script installs and configures pre-commit hooks for the project

set -e

echo "🔧 Setting up pre-commit hooks..."

# Check if pre-commit is installed
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Installing pre-commit..."

    # Try pip3 first, then pip
    if command -v pip3 &> /dev/null; then
        pip3 install pre-commit
    elif command -v pip &> /dev/null; then
        pip install pre-commit
    else
        echo "❌ Error: pip or pip3 not found. Please install Python and pip first."
        echo "   Visit: https://www.python.org/downloads/"
        exit 1
    fi
fi

# Install the pre-commit hooks
echo "🪝 Installing pre-commit hooks into .git/hooks/..."
pre-commit install

# Install commit-msg hook for commit message linting (optional)
pre-commit install --hook-type commit-msg

# Generate secrets baseline (for detect-secrets hook)
if [ ! -f .secrets.baseline ]; then
    echo "🔐 Generating secrets baseline..."
    detect-secrets scan > .secrets.baseline 2>/dev/null || true
fi

echo ""
echo "✅ Pre-commit hooks installed successfully!"
echo ""
echo "📝 Usage:"
echo "  - Hooks will run automatically on 'git commit'"
echo "  - Run manually: pre-commit run --all-files"
echo "  - Skip hooks (not recommended): git commit --no-verify"
echo ""
echo "🧪 Testing hooks on all files (this may take a minute)..."
pre-commit run --all-files || {
    echo ""
    echo "⚠️  Some hooks found issues (see above)"
    echo "   Don't worry - most issues will be auto-fixed on your next commit!"
    echo ""
}

echo ""
echo "🎉 Setup complete! Your commits will now be automatically linted."
