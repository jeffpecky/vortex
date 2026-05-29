import { describe, it, expect } from 'bun:test'

describe('modifiers-napi', () => {
  it('should export getModifiers function', async () => {
    const mod = await import('../index.ts')
    expect(mod.getModifiers).toBeDefined()
    expect(typeof mod.getModifiers).toBe('function')
  })

  it('should export isModifierPressed function', async () => {
    const mod = await import('../index.ts')
    expect(mod.isModifierPressed).toBeDefined()
    expect(typeof mod.isModifierPressed).toBe('function')
  })

  it('should export getActiveModifiersJson function', async () => {
    const mod = await import('../index.ts')
    expect(mod.getActiveModifiersJson).toBeDefined()
    expect(typeof mod.getActiveModifiersJson).toBe('function')
  })

  it('should return empty array on non-macOS (no native module)', async () => {
    const mod = await import('../index.ts')
    const result = mod.getModifiers()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  it('should return false on non-macOS (no native module)', async () => {
    const mod = await import('../index.ts')
    const result = mod.isModifierPressed('shift')
    expect(result).toBe(false)
  })

  it('should return empty JSON on non-macOS (no native module)', async () => {
    const mod = await import('../index.ts')
    const result = mod.getActiveModifiersJson()
    expect(result).toBe('{}')
  })
})
