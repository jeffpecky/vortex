import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'
import {
  platformExecutable,
  platformPackage,
} from '../bin/platform-package.js'
import { launch } from '../bin/vortex.js'

describe('native platform package mapping', () => {
  it('maps every supported platform and architecture', () => {
    expect(platformPackage('win32', 'x64')).toBe('@sleepyhallow/vortex-win32-x64')
    expect(platformPackage('win32', 'arm64')).toBe('@sleepyhallow/vortex-win32-arm64')
    expect(platformPackage('linux', 'x64')).toBe('@sleepyhallow/vortex-linux-x64')
    expect(platformPackage('linux', 'arm64')).toBe('@sleepyhallow/vortex-linux-arm64')
    expect(platformPackage('darwin', 'x64')).toBe('@sleepyhallow/vortex-darwin-x64')
    expect(platformPackage('darwin', 'arm64')).toBe('@sleepyhallow/vortex-darwin-arm64')
  })

  it('rejects unsupported targets clearly', () => {
    expect(() => platformPackage('freebsd', 'x64')).toThrow(
      'Unsupported platform/architecture: freebsd/x64',
    )
    expect(() => platformPackage('linux', 'riscv64')).toThrow(
      'Unsupported platform/architecture: linux/riscv64',
    )
  })

  it('uses the Windows executable suffix only on Windows', () => {
    expect(platformExecutable('win32')).toBe('vortex.exe')
    expect(platformExecutable('linux')).toBe('vortex')
    expect(platformExecutable('darwin')).toBe('vortex')
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
})
