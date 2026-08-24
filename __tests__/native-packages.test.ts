import { describe, expect, it } from 'bun:test'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

const TARGETS = [
  { platform: 'win32', arch: 'x64' },
  { platform: 'win32', arch: 'arm64' },
  { platform: 'linux', arch: 'x64' },
  { platform: 'linux', arch: 'arm64' },
  { platform: 'darwin', arch: 'x64' },
  { platform: 'darwin', arch: 'arm64' },
] as const

const loadRoot = () => JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'))
const loadManifest = (target: (typeof TARGETS)[number]) =>
  JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'npm', 'native', `${target.platform}-${target.arch}`, 'package.json'),
      'utf8',
    ),
  )

describe('native packages', () => {
  it('should have a manifest for every target', () => {
    for (const target of TARGETS) {
      const dir = resolve(process.cwd(), 'npm', 'native', `${target.platform}-${target.arch}`)
      expect(existsSync(resolve(dir, 'package.json'))).toBe(true)
    }
  })

  it('should have exactly six manifests with unique names', () => {
    const nativeDir = resolve(process.cwd(), 'npm', 'native')
    const actualDirs = readdirSync(nativeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'node_modules')
      .map((entry) => entry.name)
      .sort()
    const expectedDirs = TARGETS.map((t) => `${t.platform}-${t.arch}`).sort()
    expect(actualDirs).toEqual(expectedDirs)

    const names = new Set<string>()
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      names.add(pkg.name)
    }
    expect(names.size).toBe(6)
  })

  it('should name each manifest @sleepyhallow/vortex-<platform>-<arch>', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.name).toBe(`@sleepyhallow/vortex-${target.platform}-${target.arch}`)
    }
  })

  it('should match root package.json version exactly', () => {
    const root = loadRoot()
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.version).toBe(root.version)
    }
  })

  it('should be ES modules with exact os/cpu arrays per target', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.type).toBe('module')
      expect(pkg.os).toEqual([target.platform])
      expect(pkg.cpu).toEqual([target.arch])
    }
  })

  it('should have exact files list', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.files).toEqual(['bin/', 'README.md', 'LICENSE.md'])
    }
  })

  it('should have public publish config with provenance', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.publishConfig).toEqual({ access: 'public', provenance: true })
    }
  })

  it('should point at the vortex repository', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.repository).toBe('https://github.com/jeffpecky/vortex')
    }
  })

  it('should have a brief per-target description', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(typeof pkg.description).toBe('string')
      expect(pkg.description.length).toBeGreaterThan(0)
      expect(pkg.description).toContain(`${target.platform}-${target.arch}`)
    }
  })

  it('should use the root LICENSE.md reference convention', () => {
    const root = loadRoot()
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.license).toBe(root.license)
      expect(pkg.license).toBe('SEE LICENSE IN LICENSE.md')
    }
  })

  it('should declare no scripts, dependencies, or bin mapping', () => {
    for (const target of TARGETS) {
      const pkg = loadManifest(target)
      expect(pkg.scripts).toBeUndefined()
      expect(pkg.dependencies).toBeUndefined()
      expect(pkg.devDependencies).toBeUndefined()
      expect(pkg.optionalDependencies).toBeUndefined()
      expect(pkg.bin).toBeUndefined()
    }
  })

  it('should ship shared README explaining auto-install', () => {
    const readmePath = resolve(process.cwd(), 'npm', 'native', 'README.md')
    expect(existsSync(readmePath)).toBe(true)
    const readme = readFileSync(readmePath, 'utf8')
    expect(readme).toContain('@sleepyhallow/vortex')
    expect(readme.toLowerCase()).toContain('automatically installed')
    expect(readme.toLowerCase()).toContain('do not install directly')
  })
})
