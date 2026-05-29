import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('TypeScript configuration', () => {
  it('should have valid tsconfig.json', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
    
    expect(tsconfig.compilerOptions).toBeDefined()
    expect(tsconfig.include).toBeDefined()
    expect(tsconfig.exclude).toBeDefined()
  })

  it('should have strict mode enabled', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
    
    expect(tsconfig.compilerOptions.strict).toBe(true)
    expect(tsconfig.compilerOptions.noUncheckedIndexedAccess).toBe(true)
    expect(tsconfig.compilerOptions.noFallthroughCasesInSwitch).toBe(true)
  })

  it('should use ESNext target and module', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
    
    expect(tsconfig.compilerOptions.target).toBe('ESNext')
    expect(tsconfig.compilerOptions.module).toBe('ESNext')
    expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler')
  })

  it('should have proper path mappings', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
    
    expect(tsconfig.compilerOptions.paths).toBeDefined()
    expect(tsconfig.compilerOptions.paths['src/*']).toEqual(['./src/*'])
    expect(tsconfig.compilerOptions.paths['bun:bundle']).toEqual(['./shims/bun-bundle.d.ts'])
  })

  it('should include src and shims directories', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
    
    expect(tsconfig.include).toContain('src/**/*')
    expect(tsconfig.include).toContain('shims/**/*')
  })

  it('should exclude node_modules, dist, and vendor', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
    
    expect(tsconfig.exclude).toContain('node_modules')
    expect(tsconfig.exclude).toContain('dist')
    expect(tsconfig.exclude).toContain('vendor')
  })
})
