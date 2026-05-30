#!/bin/bash
set -euo pipefail

ARCH=$(uname -m)
OUT_DIR="build"
mkdir -p "$OUT_DIR"

swiftc -O -whole-module-optimization \
    -module-name ComputerUseSwiftCore \
    -emit-library -o "$OUT_DIR/libcomputer_use.dylib" \
    src/Core.swift src/bridge.swift

install_name_tool -id "@rpath/libcomputer_use.dylib" \
    "$OUT_DIR/libcomputer_use.dylib"

LDFLAGS="-L$OUT_DIR -lcomputer_use" \
npx node-gyp rebuild --arch=$ARCH

cp "build/Release/computer_use.node" "$OUT_DIR/computer_use.node"
