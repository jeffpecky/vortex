import { describe, expect, it } from 'bun:test'
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  getExecutableName,
  getPlatformPackage,
} from '../bin/platform-package.js'
import { launch } from '../bin/vortex.js'

function canCreateSymlink() {
  const root = mkdtempSync(join(tmpdir(), 'vortex-symlink-check-'))
  try {
    const target = join(root, 'target')
    writeFileSync(target, '')
    symlinkSync(target, join(root, 'link'), 'file')
    return true
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) return false
    throw error
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

const symlinksAvailable = canCreateSymlink()

function createLauncherFixture() {
  const root = mkdtempSync(join(tmpdir(), 'vortex-launcher-'))
  const packageName = getPlatformPackage(process.platform, process.arch)
  const packageRoot = join(root, 'node_modules', ...packageName.split('/'))
  const packageBin = join(packageRoot, 'bin')
  mkdirSync(join(root, 'bin'), { recursive: true })
  mkdirSync(packageBin, { recursive: true })
  copyFileSync(resolve('bin/platform-package.js'), join(root, 'bin', 'platform-package.js'))
  copyFileSync(resolve('bin/vortex.js'), join(root, 'bin', 'vortex.js'))
  writeFileSync(join(packageRoot, 'package.json'), JSON.stringify({ name: packageName }))
  const executable = join(packageBin, getExecutableName(process.platform))
  copyFileSync(process.execPath, executable)
  chmodSync(executable, 0o755)
  return root
}

describe('native platform package mapping', () => {
  it('maps every supported platform and architecture', () => {
    expect(getPlatformPackage('win32', 'x64')).toBe('@sleepyhallow/vortex-win32-x64')
    expect(getPlatformPackage('win32', 'arm64')).toBe('@sleepyhallow/vortex-win32-arm64')
    expect(getPlatformPackage('linux', 'x64')).toBe('@sleepyhallow/vortex-linux-x64')
    expect(getPlatformPackage('linux', 'arm64')).toBe('@sleepyhallow/vortex-linux-arm64')
    expect(getPlatformPackage('darwin', 'x64')).toBe('@sleepyhallow/vortex-darwin-x64')
    expect(getPlatformPackage('darwin', 'arm64')).toBe('@sleepyhallow/vortex-darwin-arm64')
  })

  it('rejects unsupported targets clearly', () => {
    expect(() => getPlatformPackage('freebsd', 'x64')).toThrow(
      'Unsupported platform/architecture: freebsd/x64',
    )
    expect(() => getPlatformPackage('linux', 'riscv64')).toThrow(
      'Unsupported platform/architecture: linux/riscv64',
    )
  })

  it('uses the Windows executable suffix only on Windows', () => {
    expect(getExecutableName('win32')).toBe('vortex.exe')
    expect(getExecutableName('linux')).toBe('vortex')
    expect(getExecutableName('darwin')).toBe('vortex')
  })
})

describe('native launcher', () => {
  it('resolves the package, derives the executable, and forwards arguments', () => {
    const calls: unknown[][] = []
    const status = launch({
      platform: 'linux',
      arch: 'arm64',
      args: ['--model', 'sonnet'],
      resolvePackage: (specifier) => {
        expect(specifier).toBe('@sleepyhallow/vortex-linux-arm64/package.json')
        return join('fixture', 'node_modules', '@sleepyhallow', 'vortex-linux-arm64', 'package.json')
      },
      spawn: (...args) => {
        calls.push(args)
        return { status: 23, signal: null }
      },
      writeError: () => {},
    })

    expect(calls).toEqual([[
      join('fixture', 'node_modules', '@sleepyhallow', 'vortex-linux-arm64', 'bin', 'vortex'),
      ['--model', 'sonnet'],
      { stdio: 'inherit', windowsHide: true },
    ]])
    expect(status).toEqual({ status: 23, signal: null })
  })

  it('reports a missing optional package with reinstall guidance', () => {
    const errors: string[] = []
    const status = launch({
      platform: 'darwin',
      arch: 'x64',
      args: [],
      resolvePackage: () => { throw Object.assign(new Error('missing'), { code: 'MODULE_NOT_FOUND' }) },
      spawn: () => { throw new Error('must not spawn') },
      writeError: (message) => errors.push(message),
    })

    expect(status).toEqual({ status: 1, signal: null })
    expect(errors.join('\n')).toContain('@sleepyhallow/vortex-darwin-x64')
    expect(errors.join('\n')).toContain('npm install -g @sleepyhallow/vortex')
  })

  it('reports spawn errors and exits unsuccessfully', () => {
    const errors: string[] = []
    const status = launch({
      platform: 'win32',
      arch: 'x64',
      args: [],
      resolvePackage: () => join('fixture', 'package.json'),
      spawn: () => ({ status: null, signal: null, error: new Error('access denied') }),
      writeError: (message) => errors.push(message),
    })

    expect(status).toEqual({ status: 1, signal: null })
    expect(errors.join('\n')).toContain('access denied')
  })

  it('reports a thrown spawn error and exits unsuccessfully', () => {
    const errors: string[] = []
    const status = launch({
      platform: 'linux',
      arch: 'x64',
      args: [],
      resolvePackage: () => join('fixture', 'package.json'),
      spawn: () => { throw new Error('spawn failed') },
      writeError: (message) => errors.push(message),
    })

    expect(status).toEqual({ status: 1, signal: null })
    expect(errors.join('\n')).toContain('spawn failed')
  })

  it('preserves the native executable signal', () => {
    const result = launch({
      platform: 'linux',
      arch: 'x64',
      args: [],
      resolvePackage: () => join('fixture', 'package.json'),
      spawn: () => ({ status: null, signal: 'SIGTERM' }),
      writeError: () => {},
    })

    expect(result).toEqual({ status: null, signal: 'SIGTERM' })
  })
})

describe('launcher process behavior', () => {
  it('forwards arguments through the native executable and propagates its exit code', () => {
    const root = createLauncherFixture()
    try {
      const child = join(root, 'child.mjs')
      writeFileSync(child, 'console.log(JSON.stringify(process.argv.slice(2))); process.exit(19)')

      const result = spawnSync(
        process.execPath,
        [join(root, 'bin', 'vortex.js'), child, 'alpha', 'two words'],
        { encoding: 'utf8' },
      )

      expect(result.stdout.trim()).toBe('["alpha","two words"]')
      expect(result.status).toBe(19)
      expect(result.signal).toBeNull()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it.skipIf(!symlinksAvailable)('launches through an npm-style symlink', () => {
    const root = createLauncherFixture()
    try {
      const child = join(root, 'child.mjs')
      const npmBin = join(root, 'node_modules', '.bin')
      const linkedLauncher = join(npmBin, 'vortex')
      mkdirSync(npmBin, { recursive: true })
      writeFileSync(child, 'console.log(process.argv[2]); process.exit(17)')
      symlinkSync(join(root, 'bin', 'vortex.js'), linkedLauncher, 'file')

      const result = spawnSync(process.execPath, [linkedLauncher, child, 'through-link'], {
        encoding: 'utf8',
      })

      expect(result.stdout.trim()).toBe('through-link')
      expect(result.status).toBe(17)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  if (process.platform !== 'win32') it('propagates a native executable signal without signaling the test process', () => {
    const root = createLauncherFixture()
    try {
      const child = join(root, 'signal.mjs')
      writeFileSync(child, "process.kill(process.pid, 'SIGTERM')")

      const result = spawnSync(process.execPath, [join(root, 'bin', 'vortex.js'), child])

      expect(result.signal).toBe('SIGTERM')
      expect(result.status).toBeNull()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
