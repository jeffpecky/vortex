import { describe, expect, it } from 'bun:test'
import { win32 } from 'path'

import {
  getBundledRipgrepPath,
  getVendoredRipgrepPath,
} from '../src/utils/ripgrep'

describe('ripgrep resolution', () => {
  it('resolves bundled Windows ripgrep beside the executable', () => {
    const execPath = 'C:\\tools\\vortex\\vortex.exe'

    expect(
      getBundledRipgrepPath({
        platform: 'win32',
        arch: 'x64',
        execPath,
      }),
    ).toBe(win32.join(win32.dirname(execPath), 'rg.exe'))
  })

  it('resolves bundled Unix ripgrep beside the executable', () => {
    expect(
      getBundledRipgrepPath({
        platform: 'linux',
        arch: 'x64',
        execPath: '/opt/vortex/vortex',
      }),
    ).toBe('/opt/vortex/rg')
  })

  it('resolves vendored Windows ripgrep under package root', () => {
    expect(
      getVendoredRipgrepPath({
        platform: 'win32',
        arch: 'x64',
        packageRoot: String.raw`C:\tools\vortex`,
      }),
    ).toBe(String.raw`C:\tools\vortex\vendor\ripgrep\x64-win32\rg.exe`)
  })

  it('resolves vendored Unix ripgrep under package root', () => {
    expect(
      getVendoredRipgrepPath({
        platform: 'linux',
        arch: 'x64',
        packageRoot: '/opt/vortex',
      }),
    ).toBe('/opt/vortex/vendor/ripgrep/x64-linux/rg')
  })
})
