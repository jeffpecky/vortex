import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('build configuration', () => {
  it('should have valid build.ts with feature flags', () => {
    const buildPath = resolve(process.cwd(), 'build.ts')
    const buildContent = readFileSync(buildPath, 'utf8')
    
    // Check for essential build components
    expect(buildContent).toContain('FEATURE_FLAGS')
    expect(buildContent).toContain('Bun.build')
    expect(buildContent).toContain('bunBundlePlugin')
  })

  it('should have consistent version between build.ts and package.json', () => {
    const buildPath = resolve(process.cwd(), 'build.ts')
    const buildContent = readFileSync(buildPath, 'utf8')
    
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    // Extract version from build.ts
    const versionMatch = buildContent.match(/const version = process\.env\.VERSION \|\| '([^']+)'/)
    expect(versionMatch).toBeTruthy()
    
    const buildVersion = versionMatch![1]
    expect(buildVersion).toBe(pkg.version)
  })

  it('should define feature flags with proper structure', () => {
    const buildPath = resolve(process.cwd(), 'build.ts')
    const buildContent = readFileSync(buildPath, 'utf8')
    
    // Check for feature flag categories
    expect(buildContent).toContain('TESTED & WORKING')
    expect(buildContent).toContain('INFRA')
    expect(buildContent).toContain('MISSING SOURCE')
  })

  it('should have proper build output configuration', () => {
    const buildPath = resolve(process.cwd(), 'build.ts')
    const buildContent = readFileSync(buildPath, 'utf8')
    
    expect(buildContent).toContain("entrypoints: ['src/entrypoints/cli.tsx']")
    expect(buildContent).toContain("outdir: shouldCompile ? undefined : 'dist'")
    expect(buildContent).toContain("target: 'bun'")
    expect(buildContent).toContain("sourcemap: 'linked'")
  })

  it('should copy ripgrep beside the compiled executable', () => {
    const buildPath = resolve(process.cwd(), 'build.ts')
    const buildContent = readFileSync(buildPath, 'utf8')

    expect(buildContent).toContain('copyRipgrepSidecar')
    expect(buildContent).toContain("'vendor'")
    expect(buildContent).toContain("'ripgrep'")
    expect(buildContent).toContain("'rg.exe'")
  })

  it('should externalize specific dependencies', () => {
    const buildPath = resolve(process.cwd(), 'build.ts')
    const buildContent = readFileSync(buildPath, 'utf8')
    
    expect(buildContent).toContain("external: ['react-devtools-core', 'sharp']")
  })
})
