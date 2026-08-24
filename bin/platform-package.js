const PACKAGES = {
  'win32-x64': '@sleepyhallow/vortex-win32-x64',
  'win32-arm64': '@sleepyhallow/vortex-win32-arm64',
  'linux-x64': '@sleepyhallow/vortex-linux-x64',
  'linux-arm64': '@sleepyhallow/vortex-linux-arm64',
  'darwin-x64': '@sleepyhallow/vortex-darwin-x64',
  'darwin-arm64': '@sleepyhallow/vortex-darwin-arm64',
}

export function getPlatformPackage(platform, arch) {
  const packageName = PACKAGES[`${platform}-${arch}`]
  if (!packageName) {
    throw new Error(`Unsupported platform/architecture: ${platform}/${arch}`)
  }
  return packageName
}

export function getExecutableName(platform) {
  return platform === 'win32' ? 'vortex.exe' : 'vortex'
}
