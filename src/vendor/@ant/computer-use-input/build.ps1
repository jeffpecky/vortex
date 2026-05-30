# PowerShell build script for computer-use-input
$ErrorActionPreference = "Stop"

# Find platform/arch
$PLATFORM = node -e "console.log(process.platform)"
$ARCH = node -e "console.log(process.arch)"

# Binaries go in vendor/computer-use-input/<arch>-<platform>/ at repo root
# From src/vendor/@ant/computer-use-input/, go up 4 levels to root
$TARGET_DIR = "..\..\..\..\vendor\computer-use-input\$ARCH-$PLATFORM"

Write-Host "Building for $PLATFORM-$ARCH..."

# Build Rust addon
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
bun run build

# Create target dir
New-Item -ItemType Directory -Path $TARGET_DIR -Force | Out-Null

# Copy binary
Copy-Item "computer-use-input.node" "$TARGET_DIR\computer-use-input.node" -Force

Write-Host "Binary placed at $TARGET_DIR\computer-use-input.node"
