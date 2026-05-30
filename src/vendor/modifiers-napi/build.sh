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

# Run node-gyp configure first so gyp sets up its build directory
echo "Configuring Node addon build..."
npx node-gyp configure --arch="$NODE_ARCH"

# Compile Swift code to static library
echo "Compiling Swift to static library..."
swiftc -static -emit-library \
    -target "$SWIFT_TARGET" \
    -module-name ModifiersDetector \
    -o "build/libmodifiers_static.a" \
    src/ModifiersDetector.swift src/bridge.swift

# Verify Swift library was created
if [ ! -f "build/libmodifiers_static.a" ]; then
    echo "ERROR: Swift library was not created!"
    ls -la build/ || true
    exit 1
fi
echo "Swift library created: $(ls -lh build/libmodifiers_static.a | awk '{print $5}')"

# Build Node addon with static linking (build step only, configure already done)
echo "Building Node addon with static linking..."
npx node-gyp build --arch="$NODE_ARCH"

# Copy to final location
echo "Copying to build directory..."
cp "build/Release/modifiers.node" "build/modifiers.node"

echo "Build complete: build/modifiers.node"
echo "This is a single file with Swift code statically linked."
