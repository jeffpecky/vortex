#!/bin/bash
set -euo pipefail

# Get architecture from argument or detect from system
ARCH=${1:-$(uname -m)}

# Map architecture names
if [ "$ARCH" = "x86_64" ]; then
    NODE_ARCH="x64"
    SWIFT_TARGET="x86_64-apple-macosx11.0"
elif [ "$ARCH" = "arm64" ]; then
    NODE_ARCH="arm64"
    SWIFT_TARGET="arm64-apple-macosx11.0"
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi

echo "Building for architecture: $ARCH (Node: $NODE_ARCH, Swift: $SWIFT_TARGET)"

# Create build directory
mkdir -p build

# Compile Swift code to static library
echo "Compiling Swift to static library..."
swiftc -static -emit-library \
    -target "$SWIFT_TARGET" \
    -module-name ComputerUseSwiftCore \
    -o "build/libcomputer_use_static.a" \
    src/Core.swift src/bridge.swift

# Build Node addon with static linking
echo "Building Node addon with static linking..."
npx node-gyp rebuild --arch="$NODE_ARCH"

# Copy to final location
echo "Copying to build directory..."
cp "build/Release/computer_use.node" "build/computer_use.node"

echo "Build complete: build/computer_use.node"
echo "This is a single file with Swift code statically linked."
