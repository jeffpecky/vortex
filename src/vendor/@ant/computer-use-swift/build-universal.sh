#!/bin/bash
set -euo pipefail

OUT_DIR="build"
mkdir -p "$OUT_DIR"

for ARCH in arm64 x86_64; do
    NODE_ARCH=$( [ "$ARCH" = "arm64" ] && echo "arm64" || echo "x64" )

    swiftc -O -whole-module-optimization \
        -target "${ARCH}-apple-macosx11.0" \
        -module-name ComputerUseSwiftCore \
        -emit-library -o "$OUT_DIR/libcomputer_use-${ARCH}.dylib" \
        src/Core.swift src/bridge.swift

    install_name_tool -id "@rpath/libcomputer_use.dylib" \
        "$OUT_DIR/libcomputer_use-${ARCH}.dylib"

    LDFLAGS="-L$OUT_DIR -lcomputer_use-${ARCH}" \
    npx node-gyp rebuild --arch=$NODE_ARCH

    cp "build/Release/computer_use.node" "$OUT_DIR/computer_use-${ARCH}.node"
    rm -rf build
done

lipo -create \
    "$OUT_DIR/libcomputer_use-arm64.dylib" \
    "$OUT_DIR/libcomputer_use-x86_64.dylib" \
    -output "$OUT_DIR/libcomputer_use.dylib"

lipo -create \
    "$OUT_DIR/computer_use-arm64.node" \
    "$OUT_DIR/computer_use-x86_64.node" \
    -output "$OUT_DIR/computer_use.node"

rm "$OUT_DIR/libcomputer_use-arm64.dylib" "$OUT_DIR/libcomputer_use-x86_64.dylib"
rm "$OUT_DIR/computer_use-arm64.node" "$OUT_DIR/computer_use-x86_64.node"
