param(
    [Parameter(Position=0)]
    [ValidatePattern('^(stable|latest|\d+\.\d+\.\d+(-[^\s]+)?)$')]
    [string]$Target = "latest"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# Check for 32-bit Windows
if (-not [Environment]::Is64BitProcess) {
    Write-Error "Claude Code does not support 32-bit Windows. Please use a 64-bit version of Windows."
    exit 1
}

$GITHUB_REPO = "jeffpecky/vortex"
$DOWNLOAD_DIR = "$env:USERPROFILE\.claude\downloads"

# Use native ARM64 binary on ARM64 Windows, x64 otherwise
if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
    $platform = "win32-arm64"
} else {
    $platform = "win32-x64"
}
New-Item -ItemType Directory -Force -Path $DOWNLOAD_DIR | Out-Null

# Get latest release version from GitHub
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$GITHUB_REPO/releases/latest" -ErrorAction Stop
    $version = $release.tag_name -replace '^v', ''
}
catch {
    Write-Error "Failed to get latest release from GitHub: $_"
    exit 1
}

# Reject non-version content (e.g. an HTML error page) before it reaches the manifest URL
if ($version -notmatch '^\d+\.\d+\.\d+') {
    Write-Error "Failed to get a valid version from GitHub (got unexpected content)."
    exit 1
}

# Find the standalone binary and checksum in release assets
try {
    $binaryName = "vortex-$platform.exe"
    $checksumName = "vortex-$platform.sha256"

    $binaryAsset = $release.assets | Where-Object { $_.name -eq $binaryName } | Select-Object -First 1
    $checksumAsset = $release.assets | Where-Object { $_.name -eq $checksumName } | Select-Object -First 1

    if (-not $binaryAsset) {
        Write-Error "Binary $binaryName not found in release assets"
        exit 1
    }

    if (-not $checksumAsset) {
        Write-Error "Checksum $checksumName not found in release assets"
        exit 1
    }

    $binaryUrl = $binaryAsset.browser_download_url
    $checksumUrl = $checksumAsset.browser_download_url
}
catch {
    Write-Error "Failed to find release assets: $_"
    exit 1
}

# Download and verify
$binaryPath = "$DOWNLOAD_DIR\vortex-$version-$platform.exe"
try {
    Invoke-WebRequest -Uri $binaryUrl -OutFile $binaryPath -ErrorAction Stop
}
catch {
    Write-Error "Failed to download binary: $_"
    if (Test-Path $binaryPath) {
        Remove-Item -Force $binaryPath
    }
    exit 1
}

# Download checksum file
$checksumPath = "$DOWNLOAD_DIR\vortex-$version-$platform.sha256"
try {
    Invoke-WebRequest -Uri $checksumUrl -OutFile $checksumPath -ErrorAction Stop
    $expectedChecksum = (Get-Content $checksumPath).Split(' ')[0].ToLower()
}
catch {
    Write-Error "Failed to download checksum: $_"
    Remove-Item -Force $binaryPath -ErrorAction SilentlyContinue
    Remove-Item -Force $checksumPath -ErrorAction SilentlyContinue
    exit 1
}

# Calculate checksum
$actualChecksum = (Get-FileHash -Path $binaryPath -Algorithm SHA256).Hash.ToLower()

if ($actualChecksum -ne $expectedChecksum) {
    Write-Error "Checksum verification failed"
    Remove-Item -Force $binaryPath
    Remove-Item -Force $checksumPath
    exit 1
}

# Clean up checksum file
Remove-Item -Force $checksumPath

# Run vortex install to set up launcher and shell integration
Write-Output "Setting up Vortex..."
try {
    if ($Target) {
        & $binaryPath install $Target
    }
    else {
        & $binaryPath install
    }
    # Native exit codes don't trigger $ErrorActionPreference - capture explicitly
    $installExitCode = $LASTEXITCODE
}
finally {
    try {
        # Clean up downloaded file
        # Wait a moment for any file handles to be released
        Start-Sleep -Seconds 1
        Remove-Item -Force $binaryPath
    }
    catch {
        Write-Warning "Could not remove temporary file: $binaryPath"
    }
}

if ($installExitCode -ne 0) {
    Write-Error "Installation failed (exit code $installExitCode)"
    exit $installExitCode
}

Write-Output ""
Write-Output "$([char]0x2705) Installation complete!"
Write-Output ""
