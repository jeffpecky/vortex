#!/bin/bash
set -euo pipefail

OUT_DIR="build"
mkdir -p "$OUT_DIR"

for ARCH in arm64 x86_64; do
    NODE_ARCH=$( [ "$ARCH" = "arm64" ] && echo "arm64" || echo "x64" )

    swiftc -O -whole-module-optimization \
        -target "${ARCH}-apple-macosx11.0" \
        -module-name ModifiersDetector \
        -emit-library -o "$OUT_DIR/libmodifiers-${ARCH}.dylib" \
        src/ModifiersDetector.swift src/bridge.swift

    install_name_tool -id "@rpath/libmodifiers.dylib" \
        "$OUT_DIR/libmodifiers-${ARCH}.dylib"

    LDFLAGS="-L$OUT_DIR -lmodifiers-${ARCH}" \
    npx node-gyp rebuild --arch=$NODE_ARCH

    cp "build/Release/modifiers.node" "$OUT_DIR/modifiers-${ARCH}.node"

    rm -rf build
done

lipo -create \
    "$OUT_DIR/libmodifiers-arm64.dylib" \
    "$OUT_DIR/libmodifiers-x86_64.dylib" \
    -output "$OUT_DIR/libmodifiers.dylib"

lipo -create \
    "$OUT_DIR/modifiers-arm64.node" \
    "$OUT_DIR/modifiers-x86_64.node" \
    -output "$OUT_DIR/modifiers.node"

rm "$OUT_DIR/libmodifiers-arm64.dylib" "$OUT_DIR/libmodifiers-x86_64.dylib"
rm "$OUT_DIR/modifiers-arm64.node" "$OUT_DIR/modifiers-x86_64.node"
