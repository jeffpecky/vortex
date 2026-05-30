import { describe, it, expect } from 'bun:test'

describe('computer-use-swift', () => {
  it('should export all required namespaces and functions', async () => {
    if (process.platform === 'darwin') {
      const cu = await import('../js/index.js')
      expect(cu.display).toBeDefined()
      expect(cu.display.getSize).toBeDefined()
      expect(cu.apps).toBeDefined()
      expect(cu.apps.listInstalled).toBeDefined()
      expect(cu.screenshot).toBeDefined()
    }
  })
})
