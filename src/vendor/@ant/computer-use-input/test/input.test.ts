import { describe, it, expect } from 'bun:test'

describe('computer-use-input', () => {
  it('should export all required functions when supported', async () => {
    const input = await import('../js/index.js')
    if (input.isSupported) {
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

  it('should return valid cursor position', async () => {
    const input = await import('../js/index.js')
    if (input.isSupported) {
      const pos = await input.mouseLocation()
      expect(pos).toHaveProperty('x')
      expect(pos).toHaveProperty('y')
      expect(typeof pos.x).toBe('number')
      expect(typeof pos.y).toBe('number')
    }
  })
})
