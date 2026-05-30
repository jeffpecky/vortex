#!/bin/bash
set -euo pipefail

ARCH=$(uname -m)
OUT_DIR="prebuilds"
mkdir -p "$OUT_DIR"

swiftc -O -whole-module-optimization \
    -module-name ComputerUseSwiftCore \
    -emit-library -o "$OUT_DIR/libcomputer_use.dylib" \
    src/Core.swift src/bridge.swift

install_name_tool -id "@rpath/libcomputer_use.dylib" \
    "$OUT_DIR/libcomputer_use.dylib"

npx node-gyp rebuild --arch=$ARCH

cp "build/Release/computer_use.node" "$OUT_DIR/computer_use.node"
