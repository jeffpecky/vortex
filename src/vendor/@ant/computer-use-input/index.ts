export interface MousePosition {
  x: number
  y: number
}

export interface AppInfo {
  bundleId: string
  appName: string
}

export interface ComputerUseInputAPI {
  moveMouse(x: number, y: number, animated: boolean): Promise<void>
  mouseLocation(): Promise<MousePosition>
  mouseButton(button: 'left' | 'right' | 'middle', action: 'press' | 'release' | 'click', count?: number): Promise<void>
  mouseScroll(delta: number, direction: 'vertical' | 'horizontal'): Promise<void>
  key(key: string, action: 'press' | 'release' | 'click'): Promise<void>
  keys(keys: string[]): Promise<void>
  typeText(text: string): Promise<void>
  getFrontmostAppInfo(): AppInfo | null
}

export type ComputerUseInput = 
  | { isSupported: false }
  | ({ isSupported: true } & ComputerUseInputAPI)
