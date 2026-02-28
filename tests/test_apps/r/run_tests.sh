#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "Running Kreuzberg R test suite..."
echo "Repository root: $REPO_ROOT"
echo "Script directory: $SCRIPT_DIR"
echo ""

# Install kreuzberg from r-universe if not already installed
Rscript -e '
if (!requireNamespace("kreuzberg", quietly = TRUE)) {
  cat("Installing kreuzberg from r-universe...\n")
  install.packages("kreuzberg", repos = "https://kreuzberg-dev.r-universe.dev")
}
'

cd "$SCRIPT_DIR"
Rscript main_test.R
