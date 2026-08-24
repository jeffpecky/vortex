import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('package.json configuration', () => {
  it('should have valid package.json', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.name).toBe('@sleepyhallow/vortex')
    expect(pkg.version).toBe('0.1.0')
    expect(pkg.type).toBe('module')
  })

  it('should have public release metadata', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

    expect(pkg.author).toBe('sleepyhallow')
    expect(pkg.homepage).toBe('https://github.com/jeffpecky/vortex')
    expect(pkg.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/jeffpecky/vortex.git',
    })
    expect(pkg.bugs).toEqual({ url: 'https://github.com/jeffpecky/vortex/issues' })
    expect(pkg.license).toBe('SEE LICENSE IN LICENSE.md')
    expect(pkg.publishConfig).toEqual({ access: 'public', provenance: true })
    expect(pkg.files).toEqual(['bin/', 'README.md', 'LICENSE.md'])
    expect(pkg.scripts.prepublishOnly).toBeUndefined()
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
    expect(pkg.bin).toEqual({ vortex: 'bin/vortex.js' })
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

  it('should depend on native packages for every supported platform', () => {
    const pkgPath = resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

    const targets = [
      ['win32', 'x64'],
      ['win32', 'arm64'],
      ['linux', 'x64'],
      ['linux', 'arm64'],
      ['darwin', 'x64'],
      ['darwin', 'arm64'],
    ] as const
    const expected = targets.map(
      ([platform, arch]) => [`@sleepyhallow/vortex-${platform}-${arch}`, pkg.version] as const,
    )
    const native = Object.fromEntries(
      Object.entries(pkg.optionalDependencies ?? {}).filter(([name]) =>
        name.startsWith('@sleepyhallow/vortex-'),
      ),
    )
    expect(native).toEqual(Object.fromEntries(expected))
    expect(Object.keys(pkg.optionalDependencies ?? {}).filter((n) => n.startsWith('@img/sharp-'))).toEqual([])
  })

  it('should mirror native optionalDependencies in the lockfile', () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'))
    const lock = JSON.parse(
      readFileSync(resolve(process.cwd(), 'bun.lock'), 'utf8').replace(/,\s*([}\]])/g, '$1'),
    )
    const root = Object.values(lock.workspaces)[0] as {
      optionalDependencies?: Record<string, string>
    }

    const expected = Object.fromEntries(
      Object.entries(pkg.optionalDependencies ?? {}).filter(([name]) =>
        name.startsWith('@sleepyhallow/vortex-'),
      ),
    )
    const locked = Object.fromEntries(
      Object.entries(root.optionalDependencies ?? {}).filter(([name]) =>
        name.startsWith('@sleepyhallow/vortex-'),
      ),
    )
    expect(locked).toEqual(expected)
  })

  it('should document public installation and source development', () => {
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8')

    expect(readme).toContain('npm install -g @sleepyhallow/vortex')
    expect(readme).toContain('run `vortex`')
    expect(readme).toContain('bun install')
    expect(readme).toContain('bun run build')
    expect(readme).toContain('src/')
    expect(readme).toContain('build.ts')
    expect(readme).toContain('reconstruction')
    expect(readme).toContain('@anthropic-ai/claude-code@2.1.88')
    expect(readme).toContain('https://github.com/jeffpecky/vortex/issues')
    expect(readme).toContain('https://www.npmjs.com/package/@sleepyhallow/vortex')
    expect(readme).toContain('https://img.shields.io/npm/v/@sleepyhallow/vortex.svg')
    expect(readme).not.toContain('Rebuilding from the extracted source is **not feasible**')
    expect(readme).not.toContain('source/          # extracted source tree')
  })

  it('should distinguish Vortex privacy from upstream Anthropic policies', () => {
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8')

    expect(readme).toContain('Vortex reconstruction maintainers')
    expect(readme).toContain('Anthropic services')
    expect(readme).toContain('Anthropic Privacy Policy')
    expect(readme).not.toContain('When you use Claude Code, we collect feedback')
    expect(readme).not.toContain('We have implemented several safeguards')
  })
})
