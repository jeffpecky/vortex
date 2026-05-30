#!/bin/bash
set -euo pipefail

ARCH=$(uname -m)
OUT_DIR="build"
mkdir -p "$OUT_DIR"

swiftc -O -whole-module-optimization \
    -module-name ModifiersDetector \
    -emit-library -o "$OUT_DIR/libmodifiers.dylib" \
    src/ModifiersDetector.swift src/bridge.swift

install_name_tool -id "@rpath/libmodifiers.dylib" \
    "$OUT_DIR/libmodifiers.dylib"

npx node-gyp rebuild --arch=$ARCH

cp "build/Release/modifiers.node" "$OUT_DIR/modifiers.node"
