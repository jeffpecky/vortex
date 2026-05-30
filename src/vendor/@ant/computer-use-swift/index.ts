export interface DisplayGeometry {
  width: number
  height: number
  scaleFactor: number
}

export interface InstalledApp {
  bundleId: string
  displayName: string
  path: string
}

export interface RunningApp {
  bundleId: string
  displayName: string
}

export interface ScreenshotResult {
  base64: string
  width: number
  height: number
}

export interface ComputerUseAPI {
  display: {
    getSize(displayId?: number): DisplayGeometry
    listAll(): DisplayGeometry[]
  }
  apps: {
    listInstalled(): InstalledApp[]
    listRunning(): RunningApp[]
    open(bundleId: string): boolean
  }
  screenshot: {
    captureExcluding(allowedBundleIds: string[], quality: number, targetW: number, targetH: number, displayId?: number): ScreenshotResult
  }
}
