import { describe, expect, it } from 'bun:test'
import { existsSync, statSync } from 'fs'
import { resolve } from 'path'

describe('project structure', () => {
  it('should have required configuration files', () => {
    const files = [
      'package.json',
      'tsconfig.json',
      'build.ts',
      '.gitignore',
      'README.md'
    ]
    
    for (const file of files) {
      const filePath = resolve(process.cwd(), file)
      expect(existsSync(filePath)).toBe(true)
    }
  })

  it('should have src directory', () => {
    const srcPath = resolve(process.cwd(), 'src')
    expect(existsSync(srcPath)).toBe(true)
    expect(statSync(srcPath).isDirectory()).toBe(true)
  })

  it('should have shims directory', () => {
    const shimsPath = resolve(process.cwd(), 'shims')
    expect(existsSync(shimsPath)).toBe(true)
    expect(statSync(shimsPath).isDirectory()).toBe(true)
  })

  it('should have bun-bundle shim', () => {
    const shimPath = resolve(process.cwd(), 'shims/bun-bundle.d.ts')
    expect(existsSync(shimPath)).toBe(true)
  })

  it('should have entrypoints directory', () => {
    const entrypointsPath = resolve(process.cwd(), 'src/entrypoints')
    expect(existsSync(entrypointsPath)).toBe(true)
    expect(statSync(entrypointsPath).isDirectory()).toBe(true)
  })

  it('should have cli entrypoint', () => {
    const cliPath = resolve(process.cwd(), 'src/entrypoints/cli.tsx')
    expect(existsSync(cliPath)).toBe(true)
  })
})
