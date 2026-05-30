#!/bin/bash
set -euo pipefail

# Find platform/arch
PLATFORM=$(node -p "process.platform")
ARCH=$(node -p "process.arch")
TARGET_DIR="../../../../vendor/@ant/computer-use-input/${PLATFORM}-${ARCH}"

echo "Building for ${PLATFORM}-${ARCH}..."

# Build Rust addon
bun run build

# Create target dir
mkdir -p "$TARGET_DIR"

# Copy binary
cp computer-use-input.node "$TARGET_DIR/computer-use-input.node"
echo "Binary placed at $TARGET_DIR/computer-use-input.node"
