#!/bin/bash
set -euo pipefail

ARCH_DIR="arch-artifacts"
mkdir -p "$ARCH_DIR"

for ARCH in arm64 x86_64; do
    NODE_ARCH=$( [ "$ARCH" = "arm64" ] && echo "arm64" || echo "x64" )

    swiftc -O -whole-module-optimization \
        -target "${ARCH}-apple-macosx11.0" \
        -module-name ModifiersDetector \
        -emit-library -o "$ARCH_DIR/libmodifiers-${ARCH}.dylib" \
        src/ModifiersDetector.swift src/bridge.swift

    install_name_tool -id "@rpath/libmodifiers.dylib" \
        "$ARCH_DIR/libmodifiers-${ARCH}.dylib"

    npx node-gyp rebuild --arch=$NODE_ARCH

    cp "build/Release/modifiers.node" "$ARCH_DIR/modifiers-${ARCH}.node"
    rm -rf build
done

mkdir -p build

lipo -create \
    "$ARCH_DIR/libmodifiers-arm64.dylib" \
    "$ARCH_DIR/libmodifiers-x86_64.dylib" \
    -output "build/libmodifiers.dylib"

lipo -create \
    "$ARCH_DIR/modifiers-arm64.node" \
    "$ARCH_DIR/modifiers-x86_64.node" \
    -output "build/modifiers.node"

rm "$ARCH_DIR/libmodifiers-arm64.dylib" "$ARCH_DIR/libmodifiers-x86_64.dylib"
rm "$ARCH_DIR/modifiers-arm64.node" "$ARCH_DIR/modifiers-x86_64.node"
rmdir "$ARCH_DIR"
