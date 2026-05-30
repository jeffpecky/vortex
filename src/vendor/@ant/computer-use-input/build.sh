#!/bin/bash
set -euo pipefail

# Find platform/arch
PLATFORM=$(node -p "process.platform")
ARCH=$(node -p "process.arch")
# Binaries go in vendor/computer-use-input/<arch>-<platform>/ at repo root
# From src/vendor/@ant/computer-use-input/, go up 4 levels to root
TARGET_DIR="../../../../vendor/computer-use-input/${ARCH}-${PLATFORM}"

echo "Building for ${PLATFORM}-${ARCH}..."

# Build Rust addon
bun run build

# Create target dir
mkdir -p "$TARGET_DIR"

# Copy binary
cp computer-use-input.node "$TARGET_DIR/computer-use-input.node"
echo "Binary placed at $TARGET_DIR/computer-use-input.node"
