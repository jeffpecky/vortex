import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('package.json configuration', () => {
  it('should have valid package.json', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.name).toBeDefined()
    expect(pkg.version).toBeDefined()
    expect(pkg.type).toBe('module')
  })

  it('should have build script', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.scripts).toBeDefined()
    expect(pkg.scripts.build).toBe('bun run build.ts')
  })

  it('should have proper bin configuration', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.bin).toBeDefined()
    expect(pkg.bin.claude).toBe('cli.js')
  })

  it('should have required dependencies', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.dependencies).toBeDefined()
    expect(Object.keys(pkg.dependencies).length).toBeGreaterThan(0)
  })

  it('should have TypeScript in devDependencies', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.devDependencies).toBeDefined()
    expect(pkg.devDependencies.typescript).toBeDefined()
  })

  it('should specify Node.js engine requirement', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.engines).toBeDefined()
    expect(pkg.engines.node).toBeDefined()
  })
})
