import { describe, it, expect, beforeAll } from 'bun:test'

describe('computer-use-input E2E', () => {
  let input: any
  let isSupported: boolean
  let binaryExists: boolean

  beforeAll(async () => {
    input = await import('../src/vendor/@ant/computer-use-input/js/index.js')
    isSupported = input.isSupported === true
    // Check if the native binary was built
    const platformDir = `${process.arch}-${process.platform}`
    const { resolve } = await import('path')
    const binaryPath = resolve(
      process.cwd(),
      'vendor',
      'computer-use-input',
      platformDir,
      'computer-use-input.node',
    )
    binaryExists = await Bun.file(binaryPath).exists()
  })

  describe('Platform Support', () => {
    it('should report platform support based on binary availability', () => {
      const supportedPlatforms = [
        { platform: 'darwin', arch: 'arm64' },
        { platform: 'darwin', arch: 'x64' },
        { platform: 'win32', arch: 'x64' },
        { platform: 'linux', arch: 'x64' }
      ]
      
      const currentPlatformSupported = supportedPlatforms.some(
        p => p.platform === process.platform && p.arch === process.arch
      )
      
      // If binary exists, isSupported should match platform support.
      // If binary doesn't exist (not built), isSupported is false.
      if (binaryExists) {
        expect(input.isSupported).toBe(currentPlatformSupported)
      } else {
        expect(input.isSupported).toBe(false)
      }
    })

    it('should export all required functions when supported', () => {
      if (isSupported) {
        expect(input.moveMouse).toBeDefined()
        expect(input.mouseLocation).toBeDefined()
        expect(input.mouseButton).toBeDefined()
        expect(input.mouseScroll).toBeDefined()
        expect(input.key).toBeDefined()
        expect(input.keys).toBeDefined()
        expect(input.typeText).toBeDefined()
        expect(input.getFrontmostAppInfo).toBeDefined()
      }
    })
  })

  describe('Mouse Operations', () => {
    it('should return valid cursor position', async () => {
      if (!isSupported) return

      const pos = await input.mouseLocation()
      expect(pos).toHaveProperty('x')
      expect(pos).toHaveProperty('y')
      expect(typeof pos.x).toBe('number')
      expect(typeof pos.y).toBe('number')
      expect(pos.x).toBeGreaterThanOrEqual(0)
      expect(pos.y).toBeGreaterThanOrEqual(0)
    })

    it('should move mouse to specific coordinates', async () => {
      if (!isSupported) return

      const initialPos = await input.mouseLocation()
      const targetX = Math.max(0, initialPos.x + 50)
      const targetY = Math.max(0, initialPos.y + 50)

      await input.moveMouse(targetX, targetY, false)
      
      // Give it a moment to move
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const newPos = await input.mouseLocation()
      
      // Allow small tolerance for rounding
      expect(Math.abs(newPos.x - targetX)).toBeLessThanOrEqual(2)
      expect(Math.abs(newPos.y - targetY)).toBeLessThanOrEqual(2)
    })

    it('should move mouse with animation', async () => {
      if (!isSupported) return

      const initialPos = await input.mouseLocation()
      const targetX = Math.max(0, initialPos.x + 100)
      const targetY = Math.max(0, initialPos.y + 100)

      const startTime = Date.now()
      await input.moveMouse(targetX, targetY, true)
      const duration = Date.now() - startTime

      // Animated movement should take longer than instant
      expect(duration).toBeGreaterThan(30)
      
      const newPos = await input.mouseLocation()
      expect(Math.abs(newPos.x - targetX)).toBeLessThanOrEqual(2)
      expect(Math.abs(newPos.y - targetY)).toBeLessThanOrEqual(2)
    })

    it('should handle mouse button actions', async () => {
      if (!isSupported) return

      // Test that button actions don't throw
      await expect(input.mouseButton('left', 'press', 1)).resolves.toBeUndefined()
      await new Promise(resolve => setTimeout(resolve, 50))
      await expect(input.mouseButton('left', 'release', 1)).resolves.toBeUndefined()
      
      await expect(input.mouseButton('left', 'click', 1)).resolves.toBeUndefined()
      await expect(input.mouseButton('right', 'click', 1)).resolves.toBeUndefined()
      await expect(input.mouseButton('middle', 'click', 1)).resolves.toBeUndefined()
    })

    it('should handle double click', async () => {
      if (!isSupported) return

      await expect(input.mouseButton('left', 'click', 2)).resolves.toBeUndefined()
    })

    it('should handle mouse scroll', async () => {
      if (!isSupported) return

      await expect(input.mouseScroll(10, 'vertical')).resolves.toBeUndefined()
      await expect(input.mouseScroll(-10, 'vertical')).resolves.toBeUndefined()
      await expect(input.mouseScroll(10, 'horizontal')).resolves.toBeUndefined()
      await expect(input.mouseScroll(-10, 'horizontal')).resolves.toBeUndefined()
    })
  })

  describe('Keyboard Operations', () => {
    it('should handle single key press', async () => {
      if (!isSupported) return

      await expect(input.key('a', 'press')).resolves.toBeUndefined()
      await expect(input.key('a', 'release')).resolves.toBeUndefined()
      await expect(input.key('a', 'click')).resolves.toBeUndefined()
    })

    it('should handle modifier keys', async () => {
      if (!isSupported) return

      await expect(input.key('shift', 'press')).resolves.toBeUndefined()
      await expect(input.key('shift', 'release')).resolves.toBeUndefined()
      
      await expect(input.key('control', 'press')).resolves.toBeUndefined()
      await expect(input.key('control', 'release')).resolves.toBeUndefined()
      
      await expect(input.key('alt', 'press')).resolves.toBeUndefined()
      await expect(input.key('alt', 'release')).resolves.toBeUndefined()
    })

    it('should handle special keys', async () => {
      if (!isSupported) return

      await expect(input.key('enter', 'click')).resolves.toBeUndefined()
      await expect(input.key('tab', 'click')).resolves.toBeUndefined()
      await expect(input.key('space', 'click')).resolves.toBeUndefined()
      await expect(input.key('backspace', 'click')).resolves.toBeUndefined()
      await expect(input.key('escape', 'click')).resolves.toBeUndefined()
    })

    it('should handle arrow keys', async () => {
      if (!isSupported) return

      await expect(input.key('up', 'click')).resolves.toBeUndefined()
      await expect(input.key('down', 'click')).resolves.toBeUndefined()
      await expect(input.key('left', 'click')).resolves.toBeUndefined()
      await expect(input.key('right', 'click')).resolves.toBeUndefined()
    })

    it('should handle key combinations', async () => {
      if (!isSupported) return

      // Ctrl+C
      await expect(input.keys(['control', 'c'])).resolves.toBeUndefined()
      
      // Shift+A
      await expect(input.keys(['shift', 'a'])).resolves.toBeUndefined()
      
      // Ctrl+Shift+T
      await expect(input.keys(['control', 'shift', 't'])).resolves.toBeUndefined()
    })

    it('should type text', async () => {
      if (!isSupported) return

      await expect(input.typeText('Hello World')).resolves.toBeUndefined()
      await expect(input.typeText('test@example.com')).resolves.toBeUndefined()
      await expect(input.typeText('123456')).resolves.toBeUndefined()
    })
  })

  describe('Windows-specific tests', () => {
    it('should get frontmost app info on Windows', async () => {
      if (!isSupported || process.platform !== 'win32') return

      const appInfo = input.getFrontmostAppInfo()
      
      expect(appInfo).toBeDefined()
      if (appInfo) {
        expect(appInfo).toHaveProperty('bundleId')
        expect(appInfo).toHaveProperty('appName')
        expect(typeof appInfo.bundleId).toBe('string')
        expect(typeof appInfo.appName).toBe('string')
        
        // On Windows, bundleId is the PID as a string
        expect(appInfo.bundleId).toMatch(/^\d+$/)
        expect(appInfo.appName.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Linux-specific tests', () => {
    it('should handle Linux platform gracefully', async () => {
      if (!isSupported || process.platform !== 'linux') return

      // Linux support exists but getFrontmostAppInfo returns null (no X11 integration yet)
      const appInfo = input.getFrontmostAppInfo()
      expect(appInfo).toBeNull()
      
      // But all other functions should work
      const pos = await input.mouseLocation()
      expect(pos).toHaveProperty('x')
      expect(pos).toHaveProperty('y')
    })

    it('should handle mouse operations on Linux', async () => {
      if (!isSupported || process.platform !== 'linux') return

      const initialPos = await input.mouseLocation()
      await input.moveMouse(initialPos.x + 10, initialPos.y + 10, false)
      
      const newPos = await input.mouseLocation()
      expect(newPos.x).toBeGreaterThanOrEqual(initialPos.x)
      expect(newPos.y).toBeGreaterThanOrEqual(initialPos.y)
    })

    it('should handle keyboard operations on Linux', async () => {
      if (!isSupported || process.platform !== 'linux') return

      await expect(input.key('a', 'click')).resolves.toBeUndefined()
      await expect(input.typeText('test')).resolves.toBeUndefined()
    })
  })

  describe('macOS-specific tests', () => {
    it('should get frontmost app info on macOS', async () => {
      if (!isSupported || process.platform !== 'darwin') return

      const appInfo = input.getFrontmostAppInfo()
      
      expect(appInfo).toBeDefined()
      if (appInfo) {
        expect(appInfo).toHaveProperty('bundleId')
        expect(appInfo).toHaveProperty('appName')
        expect(typeof appInfo.bundleId).toBe('string')
        expect(typeof appInfo.appName).toBe('string')
        
        // On macOS, bundleId should be a reverse domain notation
        expect(appInfo.bundleId.length).toBeGreaterThan(0)
        expect(appInfo.appName.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Error Handling', () => {
    it('should reject invalid button names', async () => {
      if (!isSupported) return

      await expect(input.mouseButton('invalid', 'click', 1)).rejects.toThrow()
    })

    it('should reject invalid actions', async () => {
      if (!isSupported) return

      await expect(input.mouseButton('left', 'invalid', 1)).rejects.toThrow()
    })

    it('should reject invalid scroll direction', async () => {
      if (!isSupported) return

      await expect(input.mouseScroll(10, 'invalid')).rejects.toThrow()
    })

    it('should reject invalid key names', async () => {
      if (!isSupported) return

      await expect(input.key('invalidkey123', 'click')).rejects.toThrow()
    })
  })
})
